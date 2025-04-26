"use client";

export default function ContactUsPage() {
  return (
    <section id="contact" className="bg-white py-28 px-8">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-6 text-gray-800">Contact Us</h2>
        <p className="text-lg mb-12 text-gray-600">
          Have questions or need help? Send us a message and we'll get back to
          you shortly.
        </p>

        <form className="grid gap-6">
          <input
            type="text"
            placeholder="Your Name"
            className="border border-gray-300 rounded-lg p-4 focus:ring focus:ring-primary focus:outline-none"
            required
          />
          <input
            type="email"
            placeholder="Your Email"
            className="border border-gray-300 rounded-lg p-4 focus:ring focus:ring-primary focus:outline-none"
            required
          />
          <textarea
            placeholder="Your Message"
            className="border border-gray-300 rounded-lg p-4 focus:ring focus:ring-primary focus:outline-none min-h-[150px]"
            required
          />
          <button
            type="submit"
            className="bg-primary text-white rounded-lg py-3 px-6 hover:bg-primary-dark transition"
          >
            Send Message
          </button>
        </form>
      </div>
    </section>
  );
}
