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

  const displayName = formData.get('displayName') as string;
  const givenName = formData.get('givenName') as string;
  const surname = formData.get('surname') as string;
  const domicle = formData.get('domicle') as string;
  const preferredFullName = formData.get('preferredFullName') as string;
  const major = formData.get('major') as string;

  const displaynameRegex = /^[a-zA-Z0-9]{3,30}$/;
  const givenNameRegex = /^.{2,70}$/;
  const surnameRegex = /^.{2,35}$/;
  const domicleRegex = /^.{2,35}$/;
  const preferredFullNameRegex = /^.{2,100}$/;
  const majorRegex =
    /^(computer_science|mathematics|statistical_data_analysis|other)$/;

  if (!displaynameRegex.test(displayName)) {
    logger.error('Display name does not match regex');
    return {
      message: dictionary.api.invalid_display_name,
      isError: true,
      field: 'displayName',
    };
  }

  if (givenName && !givenNameRegex.test(givenName)) {
    logger.error('Given name does not match regex');
    return {
      message: dictionary.api.invalid_given_name,
      isError: true,
      field: 'givenName',
    };
  }

  if (surname && !surnameRegex.test(surname)) {
    logger.error('Surname does not match regex');
    return {
      message: dictionary.api.invalid_surname,
      isError: true,
      field: 'surname',
    };
  }

  if (domicle && !domicleRegex.test(domicle)) {
    logger.error('Domicle does not match regex');
    return {
      message: dictionary.api.invalid_domicle,
      isError: true,
      field: 'domicle',
    };
  }

  if (preferredFullName && !preferredFullNameRegex.test(preferredFullName)) {
    logger.error('Preferred full name does not match regex');
    return {
      message: dictionary.api.invalid_preferred_full_name,
      isError: true,
      field: 'preferredFullName',
    };
  }

  if (major && !majorRegex.test(major)) {
    logger.error('Major does not match regex');
    return {
      message: dictionary.api.invalid_major,
      isError: true,
      field: 'major',
    };
  }

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
    (major || domicle) &&
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

  if (
    currentUserData.displayName === displayName &&
    currentUserData.givenName === givenName &&
    currentUserData.surname === surname &&
    currentUserData.extension_3c0a9d6308d649589e6b4e1f57006bcc_Domicle ===
      domicle &&
    currentUserData.extension_3c0a9d6308d649589e6b4e1f57006bcc_PreferredFullName ===
      preferredFullName &&
    currentUserData.extension_3c0a9d6308d649589e6b4e1f57006bcc_Major === major
  ) {
    logger.error('Tried to update profile with no changes');
    return {
      message: dictionary.api.no_changes_detected,
      isError: true,
    };
  }

  await updateGraphAPIUser(accessToken, user.azureId, {
    displayName,
    givenName,
    surname,
    extension_3c0a9d6308d649589e6b4e1f57006bcc_Domicle: domicle,
    extension_3c0a9d6308d649589e6b4e1f57006bcc_PreferredFullName:
      preferredFullName,
    extension_3c0a9d6308d649589e6b4e1f57006bcc_Major: major,
  });

  revalidatePath(`/${lang}/profile`);

  await updateRateLimitCounter(user.azureId, cacheKey);

  return {
    message: dictionary.api.profile_updated,
    isError: false,
  };
}
