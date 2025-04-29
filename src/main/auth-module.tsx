// // src/components/AuthModule.tsx
// import React from "react";
// import { SignInPage } from "../pages/auth/Sign-In";
// import { ColorTheme } from "../models/ColorTheme";

// interface AuthModuleProps {
//   brandName: string;
//   colors: ColorTheme;
//   logoUrl?: string;
//   children: React.ReactNode;
//   oauthProviders?: string[];
// }

// /**
//  * Temporary test version: use a hard-coded boolean for isAuthenticated.
//  * In a real app, you'd read from your auth context / store here.
//  */
// export const AuthModule: React.FC<AuthModuleProps> = ({
//   brandName,
//   colors,
//   logoUrl,
//   oauthProviders,
//   children,
// }) => {
//   // For testing purposes, set this to false to see the SignIn page, or true if you'd prefer to skip sign-in for now.
//   const isAuthenticated = false;

//   if (!isAuthenticated) {
//     return (
//       <SignInPage
//         brandName={brandName}
//         colors={colors}
//         logoUrl={logoUrl}
//         oauthProviders={oauthProviders}
//       />
//     );
//   }

//   // If user is "authenticated", render the rest of the app (children).
//   return <>{children}</>;
// };

// export default AuthModule;
