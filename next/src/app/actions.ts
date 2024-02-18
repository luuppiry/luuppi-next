'use server';

export async function register(formData: FormData) {
  const rawFormData = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  console.log('Registering user with email:', rawFormData.email);
}

export async function login(formData: FormData) {
  const rawFormData = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  console.log('Logging in user with email:', rawFormData.email);
}
