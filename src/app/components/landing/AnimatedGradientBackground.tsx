const orbs = [
  // Top Left
  {
    className:
      "-left-[10%] -top-[8%] h-[26rem] w-[26rem] bg-[radial-gradient(circle_at_35%_35%,rgba(124,58,237,0.95)_0%,rgba(124,58,237,0.32)_42%,transparent_75%)] animate-liquid-orb-one",
  },

  // Upper Left
  {
    className:
      "left-[12%] top-[4%] h-[18rem] w-[18rem] bg-[radial-gradient(circle_at_35%_35%,rgba(16,185,129,0.9)_0%,rgba(16,185,129,0.24)_40%,transparent_74%)] animate-liquid-orb-two",
  },

  // Center Top
  {
    className:
      "left-[35%] top-[-4%] h-[24rem] w-[24rem] bg-[radial-gradient(circle_at_35%_35%,rgba(37,99,235,0.95)_0%,rgba(37,99,235,0.3)_40%,transparent_75%)] animate-liquid-orb-three",
  },

  // Top Right
  {
    className:
      "right-[8%] top-[6%] h-[22rem] w-[22rem] bg-[radial-gradient(circle_at_35%_35%,rgba(124,58,237,0.88)_0%,rgba(124,58,237,0.26)_40%,transparent_76%)] animate-liquid-orb-four",
  },

  // Far Right
  {
    className:
      "-right-[8%] top-[22%] h-[26rem] w-[26rem] bg-[radial-gradient(circle_at_35%_35%,rgba(16,185,129,0.88)_0%,rgba(16,185,129,0.22)_40%,transparent_76%)] animate-liquid-orb-five",
  },

  // Center Left
  {
    className:
      "left-[8%] top-[38%] h-[20rem] w-[20rem] bg-[radial-gradient(circle_at_35%_35%,rgba(37,99,235,0.9)_0%,rgba(37,99,235,0.25)_40%,transparent_78%)] animate-liquid-orb-six",
  },

  // Center
  {
    className:
      "left-[30%] top-[30%] h-[18rem] w-[18rem] bg-[radial-gradient(circle_at_35%_35%,rgba(124,58,237,0.85)_0%,rgba(124,58,237,0.2)_42%,transparent_78%)] animate-liquid-orb-seven",
  },

  // Center Right
  {
    className:
      "right-[18%] top-[42%] h-[20rem] w-[20rem] bg-[radial-gradient(circle_at_35%_35%,rgba(16,185,129,0.9)_0%,rgba(16,185,129,0.24)_40%,transparent_76%)] animate-liquid-orb-one",
  },

  // Bottom Leftasdasd
  {
    className:
      "-left-[8%] bottom-[0%] h-[24rem] w-[24rem] bg-[radial-gradient(circle_at_35%_35%,rgba(16,185,129,0.88)_0%,rgba(16,185,129,0.22)_42%,transparent_76%)] animate-liquid-orb-two",
  },

  // Bottom Center
  {
    className:
      "left-[32%] bottom-[-10%] h-[28rem] w-[28rem] bg-[radial-gradient(circle_at_35%_35%,rgba(124,58,237,0.82)_0%,rgba(124,58,237,0.22)_42%,transparent_78%)] animate-liquid-orb-three",
  },

  // Bottom Right
  {
    className:
      "right-[10%] bottom-[4%] h-[22rem] w-[22rem] bg-[radial-gradient(circle_at_35%_35%,rgba(37,99,235,0.92)_0%,rgba(37,99,235,0.26)_40%,transparent_78%)] animate-liquid-orb-four",
  },

  // Far Bottom Right
  {
    className:
      "-right-[10%] bottom-[-8%] h-[28rem] w-[28rem] bg-[radial-gradient(circle_at_35%_35%,rgba(37,99,235,0.9)_0%,rgba(37,99,235,0.24)_40%,transparent_78%)] animate-liquid-orb-five",
  },
];

export default function AnimatedGradientBackground() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 -z-10 overflow-hidden pointer-events-none"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(124,58,237,0.18)_0%,transparent_28%),radial-gradient(circle_at_82%_18%,rgba(16,185,129,0.16)_0%,transparent_24%),radial-gradient(circle_at_50%_85%,rgba(37,99,235,0.14)_0%,transparent_30%)] opacity-100" />

      <div className="absolute inset-0 blur-[110px] saturate-[1.6]">
        {orbs.map((orb, index) => (
          <div
            key={index}
            className={`absolute rounded-full ${orb.className} transform-gpu will-change-transform mix-blend-screen opacity-70`}
          />
        ))}
      </div>
    </div>
  );
}
