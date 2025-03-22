import { createSignal } from "solid-js";

const BouncingCard = () => {
  const [hovered, setHovered] = createSignal(false);

  return (
    <div class="flex flex-col text-white justify-center items-center w-full h-full">
      <div
        class={`transition-transform duration-300 ease-out transform ${
          hovered() ? "scale-155 rotate-2" : "scale-120"
        } shadow-lg rounded-lg p-6 w-80 h-48 flex items-center justify-center relative overflow-hidden`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div class="absolute inset-0 bg-gradient-to-r animate-gradient from-[#3B82F6] to-[#2563EB] opacity-75"></div>
        <p class="text-lg font-semibold text-white relative z-10 font-cabinet">
          My Projects
        </p>
      </div>
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Cabinet+Grotesk:wght@400;700&display=swap');
        
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 4s ease infinite;
          filter: brightness(0.9) contrast(1.2) saturate(1.1);
        }
        .font-cabinet {
          font-family: 'Cabinet Grotesk', sans-serif;
        }`}
      </style>
    </div>
  );
};

export default BouncingCard;
