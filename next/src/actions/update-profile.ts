'use server';
import { auth } from '@/auth';
import { getDictionary } from '@/dictionaries';
import { logger } from '@/libs';
import { getAccessToken } from '@/libs/get-access-token';
import { getGraphAPIUser } from '@/libs/graph/graph-get-user';
import { updateGraphAPIUser } from '@/libs/graph/graph-update-user';
import { SupportedLanguage } from '@/models/locale';
import { revalidatePath } from 'next/cache';

// TODO: Rate limit this action
export async function updateProfile(
  lang: SupportedLanguage,
  _: any,
  formData: FormData,
) {
  const dictionary = await getDictionary(lang);

  const session = await auth();
  const user = session?.user;

  if (!user) {
    logger.error('Unauthorized, user not found in session');
    return {
      message: dictionary.api.unauthorized,
      isError: true,
    };
  }

  const displayName = formData.get('displayName') as string;
  const givenName = formData.get('givenName') as string;
  const surname = formData.get('surname') as string;

  if (!displayName) {
    logger.error('Display name not found in form data');
    return {
      message: dictionary.api.invalid_display_name,
      isError: true,
      field: 'displayName',
    };
  }

  if (!givenName) {
    logger.error('Given name not found in form data');
    return {
      message: dictionary.api.invalid_given_name,
      isError: true,
      field: 'givenName',
    };
  }

  if (!surname) {
    logger.error('Surname not found in form data');
    return {
      message: dictionary.api.invalid_surname,
      isError: true,
      field: 'surname',
    };
  }

  const displaynameRegex = /^[a-zA-Z0-9]{3,30}$/;
  const givenNameRegex = /^.{2,35}$/;
  const surnameRegex = /^.{2,35}$/;

  if (!displaynameRegex.test(displayName)) {
    logger.error('Invalid display name');
    return {
      message: dictionary.api.invalid_display_name,
      isError: true,
      field: 'displayName',
    };
  }

  if (!givenNameRegex.test(givenName)) {
    logger.error('Invalid given name');
    return {
      message: dictionary.api.invalid_given_name,
      isError: true,
      field: 'givenName',
    };
  }

  if (!surnameRegex.test(surname)) {
    logger.error('Invalid surname');
    return {
      message: dictionary.api.invalid_surname,
      isError: true,
      field: 'surname',
    };
  }

  const accessToken = await getAccessToken();
  if (!accessToken) {
    logger.error('Error getting access token');
    return {
      message: dictionary.api.server_error,
      isError: true,
    };
  }

  const currentUserData = await getGraphAPIUser(accessToken, user.azureId);
  if (!currentUserData) {
    logger.error('Error getting user data');
    return {
      message: dictionary.api.server_error,
      isError: true,
    };
  }

  if (
    currentUserData.displayName === displayName &&
    currentUserData.givenName === givenName &&
    currentUserData.surname === surname
  ) {
    logger.error('No changes detected');
    return {
      message: dictionary.api.no_changes_detected,
      isError: true,
    };
  }

  await updateGraphAPIUser(accessToken, user.azureId, {
    displayName,
    givenName,
    surname,
  });

  revalidatePath(`/${lang}/profile`);

  return {
    message: dictionary.api.profile_updated,
    isError: false,
  };
}
