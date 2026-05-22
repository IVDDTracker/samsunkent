import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 20px 60px" }}>
        <h1 style={{ fontFamily: "Merriweather, serif", fontSize: 32, color: "#0f1923" }}>
          Samsun&apos;un Dijital Merkezi
        </h1>
      </main>
      <Footer />
    </>
  );
}