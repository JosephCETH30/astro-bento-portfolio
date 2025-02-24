import { type JSX, Show, createSignal } from "solid-js";

type Props = {
  children: JSX.Element;
};

function Tooltip(props: Props) {
  const [isVisible, setIsVisible] = createSignal(false);
  const [clickCount, setClickCount] = createSignal(0);

  const messages = [
    "Hai di sana!",
    "Diklik lagi?",
    "Masih di sini?",
    "Gigih juga, ya?",
    "Ada apa?",
    "Lagi? Serius?",
    "Kamu penasaran!",
    "Nggak keren!",
    "Istirahat dulu, dong!",
    "Itu mengganggu!",
    "Jangan disentuh!",
    "Jangan klik lagi!",
    "Serius?!",
    "Ribet lu!",
    "Kamu benar-benar gigih!",
    "Kenapa sih penasaran banget?",
    "Aku mulai lelah!",
    "Aku bosan!",
    "Sudah cukup!",
    "Cari hobi lain!",
    "Berhenti, tolong!",
    "Oke, yang terakhir!",
    "Udah ya, cukup!"
];


  const currentMessage = () => {
    const count = clickCount();
    if (count >= messages.length) {
      return messages[messages.length - 1];
    }
    return messages[count];
  };

  return (
    <div class="relative inline-block">
      <div
        onMouseDown={() => {
          setIsVisible(!isVisible());
          if (isVisible()) {
            setClickCount((count) => count + 1);
          }
        }}
        onMouseUp={() => {
          setIsVisible(false);
        }}
        onTouchStart={() => {
          setIsVisible(!isVisible());
          if (isVisible()) {
            setClickCount((count) => count + 1);
          }
        }}
        onTouchEnd={() => {
          setIsVisible(false);
        }}
      >
        {props.children}
      </div>

      <Show when={isVisible()}>
        <div class="absolute left-1/2 -translate-x-1/2 -translate-y-24 mt-1 w-auto max-h-[70px] p-2 bg-black text-white text-center rounded-lg z-10 shadow-custom shadow-blue-500 border border-blue-500 whitespace-normal after:content-[''] after:block after:rotate-45 after:w-4 after:h-4 after:shadow-custom after:shadow-blue-500 after:absolute after:-bottom-2 after:-translate-x-1/2 after:left-1/2 after:bg-black after:z-20">
          <p class="w-max">{currentMessage()}</p>
        </div>
      </Show>
    </div>
  );
}

export default Tooltip;
