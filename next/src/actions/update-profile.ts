'use server';
import { auth } from '@/auth';
import { getDictionary } from '@/dictionaries';
import { getAccessToken } from '@/libs/get-access-token';
import { getGraphAPIUser } from '@/libs/graph/graph-get-user';
import { getGraphAPIUserGroups } from '@/libs/graph/graph-get-user-groups';
import { updateGraphAPIUser } from '@/libs/graph/graph-update-user';
import { isRateLimited, updateRateLimitCounter } from '@/libs/rate-limiter';
import { logger } from '@/libs/utils/logger';
import { SupportedLanguage } from '@/models/locale';
import { revalidatePath } from 'next/cache';

const cacheKey = 'update-profile';

const luuppiMemberGroupId = process.env.AZURE_LUUPPI_MEMBER_GROUP;

export async function updateProfile(
  lang: SupportedLanguage,
  _: any,
  formData: FormData,
) {
  const dictionary = await getDictionary(lang);

  const session = await auth();
  const user = session?.user;

  if (!user) {
    logger.error('User not found in session');
    return {
      message: dictionary.api.unauthorized,
      isError: true,
    };
  }

  const isLimited = await isRateLimited(user.azureId, cacheKey, 10);
  if (isLimited) {
    logger.error('User is being rate limited');
    return {
      message: dictionary.api.ratelimit,
      isError: true,
    };
  }

  const fields: Record<
    string,
    { value: FormDataEntryValue | null; regex: RegExp; required?: boolean }
  > = {
    displayName: {
      value: formData.get('displayName'),
      regex: /^[a-zA-Z0-9]{3,30}$/,
      required: true,
    },
    givenName: { value: formData.get('givenName'), regex: /^.{2,70}$/ },
    surname: { value: formData.get('surname'), regex: /^.{2,35}$/ },
    extension_3c0a9d6308d649589e6b4e1f57006bcc_Domicle: {
      value: formData.get('domicle'),
      regex: /^.{2,35}$/,
    },
    extension_3c0a9d6308d649589e6b4e1f57006bcc_PreferredFullName: {
      value: formData.get('preferredFullName'),
      regex: /^.{2,100}$/,
    },
    extension_3c0a9d6308d649589e6b4e1f57006bcc_Major: {
      value: formData.get('major'),
      regex: /^(computer_science|mathematics|statistical_data_analysis|other)$/,
    },
  };

  const errors = Object.entries(fields)
    .map(([fieldName, { value, regex, required }]) =>
      validateField(
        value?.toString() ?? null,
        regex,
        dictionary,
        fieldName,
        required,
      ),
    )
    .filter((error) => error !== null);

  if (errors.length > 0) {
    return errors[0];
  }

  const fieldsToUpdate = Object.fromEntries(
    Object.entries(fields).map(([fieldName, { value }]) => [
      fieldName,
      value ? value.toString() : null,
    ]),
  );

  const accessToken = await getAccessToken();
  if (!accessToken) {
    logger.error('Error getting access token for Graph API');
    return {
      message: dictionary.api.server_error,
      isError: true,
    };
  }

  const currentUserData = await getGraphAPIUser(accessToken, user.azureId);
  if (!currentUserData) {
    logger.error('Error getting user data using Graph API');
    return {
      message: dictionary.api.server_error,
      isError: true,
    };
  }

  const currentUserGroups = await getGraphAPIUserGroups(
    accessToken,
    user.azureId,
  );
  if (!currentUserGroups) {
    logger.error('Error getting user groups using Graph API');
    return {
      message: dictionary.api.server_error,
      isError: true,
    };
  }

  if (
    (fieldsToUpdate.major || fieldsToUpdate.domicle) &&
    !currentUserGroups.value.some((group) => group.id === luuppiMemberGroupId)
  ) {
    logger.error(
      'Tried to update major or domicle without being a member of Luuppi',
    );
    return {
      message: dictionary.api.unauthorized,
      isError: true,
    };
  }

  await updateGraphAPIUser(accessToken, user.azureId, fieldsToUpdate);

  revalidatePath(`/${lang}/profile`);

  await updateRateLimitCounter(user.azureId, cacheKey);

  return {
    message: dictionary.api.profile_updated,
    isError: false,
  };
}

function validateField(
  fieldValue: string | null,
  regex: RegExp,
  dictionary: any,
  fieldName: string,
  required?: boolean,
) {
  const fieldNameSnakeCase = fieldName.replace(/([A-Z])/g, '_$1').toLowerCase();

  if (required && !fieldValue) {
    return {
      message: dictionary.api[`invalid_${fieldNameSnakeCase}`],
      isError: true,
      field: fieldName,
    };
  }

  if (fieldValue && !regex.test(fieldValue)) {
    return {
      message: dictionary.api[`invalid_${fieldNameSnakeCase}`],
      isError: true,
      field: fieldName,
    };
  }
  return null;
}
