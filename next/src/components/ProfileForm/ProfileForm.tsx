'use client';
import { getProfile, getSilentToken, logger, updateEmail } from '@/libs';
import { InteractionStatus } from '@azure/msal-browser';
import { useMsal } from '@azure/msal-react';
import { FormEvent, useEffect, useState } from 'react';
import { MdOutlineEdit } from 'react-icons/md';
import FormInput from '../FormInput/FormInput';

const initialState = {
  displayName: '',
  givenName: '',
  surname: '',
  mail: '',
};

export default function ProfileForm() {
  const { instance, inProgress } = useMsal();
  const [profile, setProfile] = useState<typeof initialState>(initialState);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const activeAccount = instance.getActiveAccount();
        if (inProgress === InteractionStatus.None && activeAccount) {
          const accessToken = await getSilentToken(instance);
          const profileData = await getProfile(accessToken);

          if (profileData) {
            setProfile({
              displayName: (profileData.displayName as string) ?? '',
              givenName: (profileData.givenName as string) ?? '',
              surname: (profileData.surname as string) ?? '',
              mail: (profileData.mail as string) ?? '',
            });
          }

          setLoading(false);
        }
      } catch (error) {
        logger.error('Failed to fetch profile', error);
      }
    })();
  }, [instance, inProgress]);

  const handleEmailUpdate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    if (!email) {
      return;
    }

    const accessToken = await getSilentToken(instance);
    await updateEmail(accessToken, email);
  };

  const handleProfileUpdate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const updatedFields = Object.fromEntries(formData.entries());

    if (Object.keys(updatedFields).length === 0) {
      return;
    }

    // const accessToken = await getSilentToken(instance);
    // await updateProfile(tokenResult.accessToken, updatedFields);
  };

  return (
    <>
      <form onSubmit={handleEmailUpdate}>
        <div className="flex w-full gap-24">
          <div className="flex-grow">
            <FormInput
              id="email"
              loading={loading}
              placeholder="Your email"
              title="Email"
              type="email"
              value={profile.mail}
            />
            <button
              className="btn btn-primary"
              disabled={loading}
              type="submit"
            >
              Update email
            </button>
          </div>
        </div>
      </form>
      <form onSubmit={handleProfileUpdate}>
        <div className="flex w-full gap-24">
          <div className="flex-grow">
            <FormInput
              id="displayName"
              loading={loading}
              placeholder="Your displayname"
              title="Display name"
              type="text"
              value={profile.displayName}
            />
            <FormInput
              id="givenName"
              loading={loading}
              placeholder="Your given name"
              title="Given name"
              type="text"
              value={profile.givenName}
            />
            <FormInput
              id="surname"
              loading={loading}
              placeholder="Your surname"
              title="Surname"
              type="text"
              value={profile.surname}
            />
            <button
              className="btn btn-primary"
              disabled={loading}
              type="submit"
            >
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
                          onClick={() => null}
                        >
                          Upload a photo...
                        </div>
                      </li>
                      <li>
                        <div
                          className="btn-disabled opacity-50"
                          role="button"
                          aria-disabled
                          onClick={() => null}
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
