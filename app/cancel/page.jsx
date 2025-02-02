import Header from "./../../Components/Header"

export default function Cancel() {
    return (
      <>
      <Header />
      <div className="flex h-[70vh] items-center justify-center bg-white text-blackx">
        <div className="text-center p-6 max-w-md border border-gray-700 rounded-lg shadow-lg">
          <h1 className="text-2xl font-semibold mb-4">Payment Canceled</h1>
          <p className="text-gray-600 mb-6">It looks like you canceled the payment. No worries, you can try again anytime.</p>
          <a href="/" className="px-4 py-2 bg-gray-800 hover:bg-gray-700 transition rounded-lg text-white">
            Go Back Home
          </a>
        </div>
      </div>
      </>
    );
  }
