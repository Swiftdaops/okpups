import HomeHero from "./HomeHero";
import PetsForYouSlider from "./components/PetsForYouSlider";

export default function Home() {
  return (
    <div className="flex min-h-screen items-start justify-center bg-transparent font-sans">
      <main className="w-full">
        <HomeHero />
        <PetsForYouSlider />
        
      </main>   
    </div>
  );
}
