import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-mm-dark">
      <div className="w-full max-w-md">
        <SignUp
          fallbackRedirectUrl="/"
          appearance={{
            elements: {
              rootBox: 'mx-auto',
              card: 'bg-mm-dark2 border border-mm-gray/20',
              formFieldInput: 'focus:ring-2 focus:ring-mm-blue',
              formFieldInput__password: 'autocomplete-new-password',
            },
          }}
        />
      </div>
    </div>
  )
}
