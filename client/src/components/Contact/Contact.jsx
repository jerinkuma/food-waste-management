
import { useState } from "react";
import {
  MapPin,
  Phone,
  Mail,
  Send,
  Loader2,
} from "lucide-react";
import client from "../../services/api";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({
    type: "",
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setFeedback({ type: "", message: "" });

    const { name, email, subject, message } = formData;

    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      setFeedback({
        type: "error",
        message: "Please fill in all fields.",
      });
      return;
    }

    if (
      name.trim().length < 2 ||
      subject.trim().length < 2 ||
      message.trim().length < 10
    ) {
      setFeedback({
        type: "error",
        message: "Please enter a valid name, subject and message.",
      });
      return;
    }

    console.log("CONTACT FORM SUBMIT:", formData);

    try {
      setLoading(true);

      const { data } = await client.post("/contact", {
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim(),
        message: message.trim(),
      });

      console.log("CONTACT API RESPONSE:", data);

      if (data.success) {
        setFeedback({
          type: "success",
          message:
            "Thank you! Your message has been sent successfully. We will contact you soon.",
        });

        setFormData({
          name: "",
          email: "",
          subject: "",
          message: "",
        });
      } else {
        setFeedback({
          type: "error",
          message: data.message || "Failed to send your message.",
        });
      }
    } catch (error) {
      console.error("CONTACT API ERROR:", error);

      setFeedback({
        type: "error",
        message:
          error.response?.data?.message ||
          "Something went wrong. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="contact"
      className="bg-green-50 py-16 md:py-24 px-5 md:px-6"
    >
      <div className="max-w-7xl mx-auto">
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
                <p className="text-gray-600">Dhaka, Bangladesh</p>
              </div>
            </div>

            <div className="flex items-center gap-5 bg-white p-5 rounded-2xl shadow">
              <div className="bg-green-100 p-4 rounded-full text-green-600">
                <Phone />
              </div>

              <div>
                <h3 className="font-bold text-lg">Phone</h3>
                <p className="text-gray-600">+880 1234-567890</p>
              </div>
            </div>

            <div className="flex items-center gap-5 bg-white p-5 rounded-2xl shadow">
              <div className="bg-green-100 p-4 rounded-full text-green-600">
                <Mail />
              </div>

              <div>
                <h3 className="font-bold text-lg">Email</h3>
                <p className="text-gray-600">feedlink.support@gmail.com</p>
              </div>
            </div>
          </div>

          {/* Right Side */}
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-3xl shadow-xl p-6 md:p-7 space-y-4"
          >
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your Name"
              maxLength={100}
              required
              disabled={loading}
              className="w-full border rounded-xl px-4 py-2.5 outline-none focus:border-green-500"
            />

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Your Email"
              maxLength={254}
              required
              disabled={loading}
              className="w-full border rounded-xl px-4 py-2.5 outline-none focus:border-green-500"
            />

            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="Subject"
              maxLength={150}
              required
              disabled={loading}
              className="w-full border rounded-xl px-4 py-2.5 outline-none focus:border-green-500"
            />

            <textarea
              rows="4"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Your Message"
              maxLength={3000}
              required
              disabled={loading}
              className="w-full border rounded-xl px-4 py-2.5 outline-none resize-none focus:border-green-500"
            />

            {feedback.message && (
              <div
                role="alert"
                className={`p-3 rounded-xl text-sm ${
                  feedback.type === "success"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {feedback.message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition text-white px-7 py-2.5 rounded-xl flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Send Message
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Contact;
