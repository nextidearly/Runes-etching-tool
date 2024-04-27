import Layout from "@/components/sections/Layout";
import Link from "next/link";

export default function Error() {
  return (
    <Layout>
      <div className="h-full flex flex-col items-center justify-center mt-32">
        <h1 className="text-5xl font-bold mb-8 animate-pulse">
          Page Not Found?
        </h1>
        <p className="text-lg mb-8 text-center">
          Whoops, this is embarassing. <br /> Looks like the page you were
          looking for wasn{"'"}t found.
        </p>
        <Link
          href="/"
          className="bg-symbol px-6 py-2 rounded-full cursor-pointer hover:bg-symbolHover transition ease-in-out"
        >
          Back to Home
        </Link>
      </div>
    </Layout>
  );
}
