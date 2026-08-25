const About = () => {
  return (
    <section
      id="about"
      className="bg-white py-16 md:py-24 px-5 md:px-6"
    >
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

        {/* Left */}
        <div>

          <p className="text-green-600 font-semibold uppercase tracking-widest">
            About FeedLink
          </p>

          <h2 className="text-3xl md:text-5xl font-bold mt-4 text-gray-800 leading-tight">
            Together We Can Reduce
            <span className="text-green-600"> Food Waste</span>
          </h2>

          <p className="text-gray-600 mt-6 leading-7">
            FeedLink is a Food Waste Management Platform that connects
            restaurants, hotels, households, NGOs and volunteers.
            Instead of throwing away surplus food, donors can easily
            share it with people in need.
          </p>

          <p className="text-gray-600 mt-4 leading-7">
            Our mission is to reduce food waste, protect the
            environment and fight hunger through smart technology.
          </p>

        </div>

        {/* Right */}

        <div className="flex justify-center">

          <div className="w-full max-w-md rounded-3xl bg-green-50 p-6 md:p-10 shadow-xl">

            <div className="space-y-4 md:space-y-6">

              <div className="rounded-xl bg-white p-4 md:p-5 shadow text-center">
                🍽 Restaurants & Hotels
              </div>

              <div className="text-center text-2xl">
                ↓
              </div>

              <div className="rounded-xl bg-green-600 text-white p-4 md:p-5 shadow text-center font-semibold">
                FeedLink Platform
              </div>

              <div className="text-center text-2xl">
                ↓
              </div>

              <div className="rounded-xl bg-white p-4 md:p-5 shadow text-center">
                🤝 NGOs & Volunteers
              </div>

              <div className="text-center text-2xl">
                ↓
              </div>

              <div className="rounded-xl bg-green-100 p-4 md:p-5 shadow text-center">
                ❤️ People in Need
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

export default About;