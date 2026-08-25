const LeftPanel = ({ isSignup }) => {
  return (
    <div className="hidden lg:flex flex-col justify-center bg-gradient-to-br from-green-900 to-green-700 px-12 text-white">

      <h1 className="text-5xl font-bold leading-tight">
        Feed<span className="text-green-300">Link</span>
      </h1>

      <div className="mt-10">

        {isSignup ? (
          <>
            <h2 className="text-3xl font-bold">
              Join FeedLink 🌱
            </h2>

            <p className="mt-4 text-lg text-green-100 leading-8">
              Create your account and become a part of our mission
              to reduce food waste and help people in need.
            </p>
          </>
        ) : (
          <>
            <h2 className="text-3xl font-bold">
              Welcome Back 👋
            </h2>

            <p className="mt-4 text-lg text-green-100 leading-8">
              Sign in to donate food, request meals,
              and make a positive impact on your community.
            </p>
          </>
        )}

      </div>

      <div className="mt-10 space-y-3 text-green-100">

        <p>✔ Reduce Food Waste</p>

        <p>✔ Connect Donors & NGOs</p>

        <p>✔ Help People in Need</p>

      </div>

    </div>
  );
};

export default LeftPanel;