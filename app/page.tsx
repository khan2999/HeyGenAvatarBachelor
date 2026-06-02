import dynamic from "next/dynamic";

const HomeClient = dynamic(() => import("@/components/HomeClient"), {
  ssr: false,
  loading: () => (
    <div style={{ minHeight: "100vh", background: "#050508", display: "flex", alignItems: "center", justifyContent: "center", color: "#00D4FF", fontFamily: "monospace", fontSize: "12px", letterSpacing: "0.3em" }}>
      LOADING...
    </div>
  ),
});

export default function Page() {
  return <HomeClient />;
}
