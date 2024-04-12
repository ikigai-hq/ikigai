import React from "react";

import AuthLayout from "components/UserCredential/AuthLayout";
import SignIn from "components/UserCredential/SignIn";

export default function Home() {
  return (
    <AuthLayout>
      <SignIn />
    </AuthLayout>
  );
}
