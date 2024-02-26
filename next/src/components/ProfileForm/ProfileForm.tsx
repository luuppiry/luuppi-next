import { auth } from '@/auth';
import { getAccessToken, getGraphAPIUser } from '@/libs';
import { SupportedLanguage } from '@/models/locale';
import { redirect } from 'next/navigation';
import { MdOutlineEdit } from 'react-icons/md';
import FormInput from '../FormInput/FormInput';

interface ProfileFormProps {
  lang: SupportedLanguage;
}

export default async function ProfileForm({ lang }: ProfileFormProps) {
  const session = await auth();
  if (!session?.user) {
    redirect(`/${lang}`);
  }

  const accessToken = await getAccessToken();
  if (!accessToken) {
    throw new Error('Error getting access token');
  }

  const user = await getGraphAPIUser(accessToken, session.user.azureId);
  if (!user) {
    throw new Error('Error getting user');
  }

  return (
    <>
      <form>
        <div className="flex w-full gap-24">
          <div className="flex-grow">
            <FormInput
              id="email"
              placeholder="Your email"
              title="Email"
              type="email"
              value={user.mail as string}
            />
            <button className="btn btn-primary" type="submit">
              Update email
            </button>
          </div>
        </div>
      </form>
      <form>
        <div className="flex w-full gap-24">
          <div className="flex-grow">
            <FormInput
              id="displayName"
              placeholder="Your displayname"
              title="Display name"
              type="text"
              value={user.displayName as string}
            />
            <FormInput
              id="givenName"
              placeholder="Your given name"
              title="Given name"
              type="text"
              value={user.givenName as string}
            />
            <FormInput
              id="surname"
              placeholder="Your surname"
              title="Surname"
              type="text"
              value={user.surname as string}
            />
            <button className="btn btn-primary" type="submit">
              Update profile
            </button>
          </div>
          <div>
            <label className="form-control my-4">
              <div className="label">
                <span className="label-text">Avatar</span>
              </div>
              <div className="indicator">
                <div className="avatar">
                  <div className="w-52 rounded-full">
                    <img src="https://daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg" />
                  </div>
                </div>
                <span className="indicator-item indicator-start indicator-bottom bottom-8 left-8">
                  <div className="dropdown">
                    <div className="btn btn-sm m-1" role="button" tabIndex={0}>
                      <MdOutlineEdit size={24} />
                      Edit
                    </div>
                    <ul
                      className="menu dropdown-content z-[1] w-52 rounded-box bg-base-100 p-2 shadow"
                      tabIndex={0}
                    >
                      <li>
                        <div
                          className="btn-disabled opacity-50"
                          role="button"
                          aria-disabled
                        >
                          Upload a photo...
                        </div>
                      </li>
                      <li>
                        <div
                          className="btn-disabled opacity-50"
                          role="button"
                          aria-disabled
                        >
                          Remove photo
                        </div>
                      </li>
                    </ul>
                  </div>
                </span>
              </div>
            </label>
          </div>
        </div>
      </form>
    </>
  );
}
