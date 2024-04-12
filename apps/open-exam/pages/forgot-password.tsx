import React, { useState } from "react";

import AuthLayout from "components/UserCredential/AuthLayout";
import ResetPasswordForm from "../components/UserCredential/ResetPasswordForm";
import ForgotPassForm from "components/UserCredential/ForgotPassForm";

export default function Home() {
  const [step, setStep] = useState<number>(1);
  const [identity, setIdentity] = useState("");

  return (
    <AuthLayout>
      {step === 1 ? (
        <ForgotPassForm setStep={setStep} onChangeIdentity={setIdentity} identity={identity} />
      ) : (
        <ResetPasswordForm setStep={setStep} identity={identity} />
      )}
    </AuthLayout>
  );
}
