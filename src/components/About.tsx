import React from "react";

const About: React.FC = () => {
  return (
    <div className="flex min-h-screen w-full flex-col p-4 md:p-12">
      <h1 className="text-3xl font-bold tracking-tight">About</h1>
      <div className="mt-8 rounded bg-gray-900 p-8 space-y-8">
      <p className="text-gray-100">
          You can play the classic game of Triple Triad against your friends or
          the computer.
        </p>
        <p className="text-gray-100">
          It's in absolutely no way affiliated with Square-Enix.
        </p>
        <p className="text-gray-100">
          All Final Fantasy characters, logos, artwork and related game media
          are copyright Square-Enix.
        </p>
      </div>
    </div>
  );
};

export default About;
