// // File: /src/components/AuthNav.js
// "use client"; // Must be at the very top
//
// import { signIn, signOut, useSession } from "next-auth/react";
//
// export default function AuthNav() {
//   const { data: session } = useSession();
//   return (
//     <nav>
//       {session ? (
//         <>
//           <span className="mr-4">
//             Welcome, {session.user?.name || session.user?.email}
//           </span>
//           <button onClick={() => signOut()} className="bg-red-500 px-3 py-1 rounded">
//             Sign Out
//           </button>
//         </>
//       ) : (
//         <button onClick={() => signIn()} className="bg-green-500 px-3 py-1 rounded">
//           Sign In
//         </button>
//       )}
//     </nav>
//   );
// }
