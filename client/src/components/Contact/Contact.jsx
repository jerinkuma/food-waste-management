import { MapPin, Phone, Mail, Send } from "lucide-react";

const Contact = () => {
  return (
    <section
      id="contact"
      className="bg-green-50 py-16 md:py-24 px-5 md:px-6"
    >
      <div className="max-w-7xl mx-auto">

        {/* Heading */}

        <div className="text-center mb-14">

          <p className="uppercase tracking-[4px] text-green-600 font-semibold">
            Contact
          </p>

          <h2 className="text-3xl md:text-5xl font-bold text-gray-800 mt-4">
            Get In Touch
          </h2>

          <p className="mt-5 text-gray-600 max-w-2xl mx-auto">
            Have questions or want to work with FeedLink?
            We'd love to hear from you.
          </p>

        </div>

        <div className="grid lg:grid-cols-2 gap-10 items-start">

          {/* Left Side */}

          <div className="space-y-5">

            <div className="flex items-center gap-5 bg-white p-5 rounded-2xl shadow">

              <div className="bg-green-100 p-4 rounded-full text-green-600">
                <MapPin />
              </div>

              <div>
                <h3 className="font-bold text-lg">Address</h3>
                <p className="text-gray-600">
                  Dhaka, Bangladesh
                </p>
              </div>

            </div>

            <div className="flex items-center gap-5 bg-white p-5 rounded-2xl shadow">

              <div className="bg-green-100 p-4 rounded-full text-green-600">
                <Phone />
              </div>

              <div>
                <h3 className="font-bold text-lg">Phone</h3>
                <p className="text-gray-600">
                  +880 1234-567890
                </p>
              </div>

            </div>

            <div className="flex items-center gap-5 bg-white p-5 rounded-2xl shadow">

              <div className="bg-green-100 p-4 rounded-full text-green-600">
                <Mail />
              </div>

              <div>
                <h3 className="font-bold text-lg">Email</h3>
                <p className="text-gray-600">
                  contact@feedlink.com
                </p>
              </div>

            </div>

          </div>

          {/* Right Side */}

          <form className="bg-white rounded-3xl shadow-xl p-6 md:p-7 space-y-4">

            <input
              type="text"
              placeholder="Your Name"
              className="w-full border rounded-xl px-4 py-2.5 outline-none focus:border-green-500"
            />

            <input
              type="email"
              placeholder="Your Email"
              className="w-full border rounded-xl px-4 py-2.5 outline-none focus:border-green-500"
            />

            <input
              type="text"
              placeholder="Subject"
              className="w-full border rounded-xl px-4 py-2.5 outline-none focus:border-green-500"
            />

            <textarea
              rows="4"
              placeholder="Your Message"
              className="w-full border rounded-xl px-4 py-2.5 outline-none resize-none focus:border-green-500"
            ></textarea>

            <button
              className="bg-green-600 hover:bg-green-700 transition text-white px-7 py-2.5 rounded-xl flex items-center gap-2"
            >
              <Send size={18} />
              Send Message
            </button>

          </form>

        </div>

      </div>
    </section>
  );
};

export default Contact;