
"use client";

import React from 'react';
import Head from 'next/head';
import Image from 'next/image';

const ComingSoonPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br">
      <Head>
        <title>Coming Soon - DAPA</title>
        <meta name="description" content="This feature is coming soon to DAPA Studio" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex-grow flex flex-col items-center justify-center p-4 text-center">
        <div className="max-w-3xl mx-auto py-12 px-6 sm:px-8 bg-white rounded-xl shadow-lg">
          {/* Logo */}
          <div className="mb-8 relative w-48 h-48 mx-auto">
            <Image
              src="/assets/DAPA2.jpeg"
              alt="DAPA Logo"
              fill
              className="object-contain"
              priority
            />
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl font-bold text-teal-600 mb-6">
            Coming Soon
          </h1>

          {/* Warm Message */}
          <div className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto space-y-4">
            <p>
              We are putting the finishing touches on this exciting new feature of DAPA.
            </p>
            <p>
              Our team is working diligently to create a seamless and powerful experience that will 
              help you build and manage your data and API journey with even greater efficiency.
            </p>
          </div>

          {/* Optional: Return button */}
          <div className="mt-12">
            <button
              onClick={() => window.history.back()}
              className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors duration-200"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </main>

      <footer className="py-4 text-center text-sm text-gray-600">
        <p>© {new Date().getFullYear()} DAPA Studio. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default ComingSoonPage;