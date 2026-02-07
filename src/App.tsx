import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";

function generateSessionId() {
  return `crab_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

function getSessionId() {
  let id = sessionStorage.getItem("crabSessionId");
  if (!id) {
    id = generateSessionId();
    sessionStorage.setItem("crabSessionId", id);
  }
  return id;
}

interface Crab {
  _id: Id<"crabs">;
  sessionId: string;
  handle: string;
  x: number;
  y: number;
  color: string;
  lastActive: number;
}

interface Message {
  _id: Id<"messages">;
  crabId: Id<"crabs">;
  text: string;
  createdAt: number;
  expiresAt: number;
}

function CrabSprite({ crab, isMe, message }: { crab: Crab; isMe: boolean; message?: Message }) {
  return (
    <div
      className="absolute transition-all duration-300 ease-out"
      style={{
        left: crab.x,
        top: crab.y,
        transform: "translate(-50%, -50%)",
        zIndex: isMe ? 100 : 10,
      }}
    >
      {/* Speech Bubble */}
      {message && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 animate-bubble-in">
          <div
            className="relative px-4 py-2 rounded-2xl shadow-lg max-w-[200px] min-w-[60px]"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(240,248,255,0.95) 100%)",
              border: `2px solid ${crab.color}`,
              boxShadow: `0 4px 20px ${crab.color}40`,
            }}
          >
            <p className="text-sm font-medium text-gray-800 break-words text-center">{message.text}</p>
            {/* Bubble tail */}
            <div
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 rotate-45"
              style={{
                background: "linear-gradient(135deg, rgba(240,248,255,0.95) 0%, rgba(255,255,255,0.95) 100%)",
                borderRight: `2px solid ${crab.color}`,
                borderBottom: `2px solid ${crab.color}`,
              }}
            />
          </div>
        </div>
      )}

      {/* Handle */}
      <div
        className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded-full text-xs font-bold"
        style={{
          background: isMe ? crab.color : `${crab.color}cc`,
          color: "white",
          textShadow: "0 1px 2px rgba(0,0,0,0.3)",
          boxShadow: isMe ? `0 0 12px ${crab.color}80` : "none",
        }}
      >
        {crab.handle} {isMe && "✨"}
      </div>

      {/* Crab/Lobster Body */}
      <div
        className={`relative ${isMe ? 'animate-crab-dance' : 'animate-crab-idle'}`}
        style={{ filter: isMe ? `drop-shadow(0 0 8px ${crab.color}80)` : "none" }}
      >
        <svg width="64" height="52" viewBox="0 0 64 52" fill="none">
          {/* Claws */}
          <ellipse cx="8" cy="20" rx="8" ry="6" fill={crab.color} className="animate-claw-left"/>
          <ellipse cx="56" cy="20" rx="8" ry="6" fill={crab.color} className="animate-claw-right"/>

          {/* Claw pincers */}
          <path d="M2 16 L0 12 L4 14" stroke={crab.color} strokeWidth="2" fill="none"/>
          <path d="M2 24 L0 28 L4 26" stroke={crab.color} strokeWidth="2" fill="none"/>
          <path d="M62 16 L64 12 L60 14" stroke={crab.color} strokeWidth="2" fill="none"/>
          <path d="M62 24 L64 28 L60 26" stroke={crab.color} strokeWidth="2" fill="none"/>

          {/* Arms connecting claws */}
          <rect x="14" y="18" width="8" height="4" rx="2" fill={crab.color} opacity="0.8"/>
          <rect x="42" y="18" width="8" height="4" rx="2" fill={crab.color} opacity="0.8"/>

          {/* Main body */}
          <ellipse cx="32" cy="28" rx="18" ry="14" fill={crab.color}/>
          <ellipse cx="32" cy="26" rx="14" ry="10" fill={`${crab.color}dd`}/>

          {/* Shell pattern */}
          <ellipse cx="32" cy="24" rx="8" ry="5" fill="white" opacity="0.2"/>

          {/* Eyes */}
          <circle cx="26" cy="20" r="5" fill="white"/>
          <circle cx="38" cy="20" r="5" fill="white"/>
          <circle cx="27" cy="20" r="3" fill="#2d3748"/>
          <circle cx="39" cy="20" r="3" fill="#2d3748"/>
          <circle cx="28" cy="19" r="1" fill="white"/>
          <circle cx="40" cy="19" r="1" fill="white"/>

          {/* Eye stalks */}
          <rect x="24" y="12" width="4" height="6" rx="2" fill={crab.color}/>
          <rect x="36" y="12" width="4" height="6" rx="2" fill={crab.color}/>

          {/* Antennae */}
          <path d="M28 12 Q26 4 20 2" stroke={crab.color} strokeWidth="2" fill="none"/>
          <path d="M36 12 Q38 4 44 2" stroke={crab.color} strokeWidth="2" fill="none"/>
          <circle cx="20" cy="2" r="2" fill={crab.color}/>
          <circle cx="44" cy="2" r="2" fill={crab.color}/>

          {/* Legs */}
          <path d="M18 34 L10 44 L8 42" stroke={crab.color} strokeWidth="3" strokeLinecap="round"/>
          <path d="M20 38 L14 50 L12 48" stroke={crab.color} strokeWidth="3" strokeLinecap="round"/>
          <path d="M46 34 L54 44 L56 42" stroke={crab.color} strokeWidth="3" strokeLinecap="round"/>
          <path d="M44 38 L50 50 L52 48" stroke={crab.color} strokeWidth="3" strokeLinecap="round"/>

          {/* Mouth */}
          <path d="M28 32 Q32 35 36 32" stroke="#2d3748" strokeWidth="2" fill="none" opacity="0.5"/>
        </svg>
      </div>
    </div>
  );
}

function AuthModal({ onClose }: { onClose: () => void }) {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      await signIn("password", formData);
      onClose();
    } catch {
      setError(flow === "signIn" ? "Invalid credentials" : "Could not create account");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
      <div className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] p-6 sm:p-8 rounded-3xl shadow-2xl max-w-md w-full border border-cyan-500/30">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
          {flow === "signIn" ? "Welcome Back!" : "Join the City"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="email"
            type="email"
            placeholder="Email"
            required
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-cyan-400 transition-colors"
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            required
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-cyan-400 transition-colors"
          />
          <input name="flow" type="hidden" value={flow} />

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-pink-500 text-white font-bold hover:from-cyan-400 hover:to-pink-400 transition-all disabled:opacity-50"
          >
            {loading ? "..." : flow === "signIn" ? "Sign In" : "Sign Up"}
          </button>
        </form>

        <div className="mt-4 flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
            className="flex-1 py-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            {flow === "signIn" ? "Create account" : "Already have account?"}
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2 text-sm text-white/50 hover:text-white/70 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function City() {
  const sessionId = useRef(getSessionId()).current;
  const cityRef = useRef<HTMLDivElement>(null);
  const [messageInput, setMessageInput] = useState("");
  const [showAuth, setShowAuth] = useState(false);

  const { isAuthenticated } = useConvexAuth();
  const { signIn, signOut } = useAuthActions();

  const getOrCreateCrab = useMutation(api.crabs.getOrCreateCrab);
  const moveCrab = useMutation(api.crabs.moveCrab);
  const postMessage = useMutation(api.crabs.postMessage);

  const allCrabs = useQuery(api.crabs.getAllCrabs) ?? [];
  const allMessages = useQuery(api.crabs.getCrabMessages) ?? [];

  const [myCrab, setMyCrab] = useState<Crab | null>(null);

  useEffect(() => {
    getOrCreateCrab({ sessionId }).then((crab) => {
      if (crab) setMyCrab(crab as Crab);
    });
  }, [sessionId, getOrCreateCrab, isAuthenticated]);

  const handleCityClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cityRef.current || !myCrab) return;

    const rect = cityRef.current.getBoundingClientRect();
    const x = Math.max(40, Math.min(rect.width - 40, e.clientX - rect.left));
    const y = Math.max(60, Math.min(rect.height - 40, e.clientY - rect.top));

    setMyCrab(prev => prev ? { ...prev, x, y } : null);
    moveCrab({ sessionId, x, y });
  }, [myCrab, sessionId, moveCrab]);

  const handlePostMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;
    postMessage({ sessionId, text: messageInput.trim() });
    setMessageInput("");
  };

  const getMessageForCrab = (crabId: Id<"crabs">) => {
    return allMessages.find((m: Message) => m.crabId === crabId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f0c29] via-[#302b63] to-[#24243e] overflow-hidden">
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 p-3 sm:p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="text-2xl sm:text-4xl animate-bounce">🦀</div>
            <div>
              <h1 className="text-lg sm:text-2xl font-black bg-gradient-to-r from-orange-400 via-pink-500 to-cyan-400 bg-clip-text text-transparent">
                CRAB CITY
              </h1>
              <p className="text-[10px] sm:text-xs text-white/50">{allCrabs.length} crabs online</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <button
                onClick={() => signOut()}
                className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white/10 text-white/70 text-xs sm:text-sm hover:bg-white/20 transition-colors"
              >
                Sign Out
              </button>
            ) : (
              <>
                <button
                  onClick={() => setShowAuth(true)}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-gradient-to-r from-cyan-500 to-pink-500 text-white text-xs sm:text-sm font-bold hover:from-cyan-400 hover:to-pink-400 transition-all"
                >
                  Sign In
                </button>
                <button
                  onClick={() => signIn("anonymous")}
                  className="hidden sm:block px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white/10 text-white/70 text-xs sm:text-sm hover:bg-white/20 transition-colors"
                >
                  Guest
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* City Area */}
      <div
        ref={cityRef}
        onClick={handleCityClick}
        className="relative w-full h-screen cursor-pointer overflow-hidden"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 80%, rgba(255, 107, 107, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(77, 150, 255, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(155, 89, 182, 0.05) 0%, transparent 70%),
            url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")
          `,
        }}
      >
        {/* Decorative buildings silhouette */}
        <div className="absolute bottom-0 left-0 right-0 h-32 sm:h-48 pointer-events-none opacity-20">
          <svg viewBox="0 0 1200 200" preserveAspectRatio="none" className="w-full h-full">
            <path d="M0 200 L0 150 L50 150 L50 100 L80 100 L80 80 L100 80 L100 100 L130 100 L130 120 L180 120 L180 60 L200 60 L200 120 L250 120 L250 140 L300 140 L300 90 L320 90 L320 70 L340 70 L340 90 L380 90 L380 110 L420 110 L420 50 L450 50 L450 110 L500 110 L500 130 L550 130 L550 80 L580 80 L580 60 L600 60 L600 80 L650 80 L650 100 L700 100 L700 70 L730 70 L730 50 L760 50 L760 100 L800 100 L800 120 L850 120 L850 90 L880 90 L880 70 L920 70 L920 110 L960 110 L960 80 L1000 80 L1000 50 L1030 50 L1030 80 L1080 80 L1080 100 L1120 100 L1120 130 L1160 130 L1160 150 L1200 150 L1200 200 Z" fill="currentColor" className="text-white"/>
          </svg>
        </div>

        {/* Ocean waves */}
        <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-24 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 animate-wave opacity-30">
            <svg viewBox="0 0 1200 100" preserveAspectRatio="none" className="w-[200%] h-full">
              <path d="M0 50 Q150 20 300 50 T600 50 T900 50 T1200 50 L1200 100 L0 100 Z" fill="url(#wave-gradient)"/>
              <defs>
                <linearGradient id="wave-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.5"/>
                  <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.5"/>
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.5"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Render all crabs */}
        {allCrabs.map((crab: Crab) => (
          <CrabSprite
            key={crab._id}
            crab={crab}
            isMe={crab.sessionId === sessionId}
            message={getMessageForCrab(crab._id)}
          />
        ))}

        {/* Click hint */}
        <div className="absolute top-20 sm:top-24 left-1/2 -translate-x-1/2 text-white/40 text-xs sm:text-sm text-center px-4">
          Click anywhere to move your crab!
        </div>
      </div>

      {/* Message Input */}
      <div className="fixed bottom-16 sm:bottom-12 left-0 right-0 p-3 sm:p-4 z-50">
        <form onSubmit={handlePostMessage} className="max-w-lg mx-auto">
          <div className="flex gap-2 bg-white/10 backdrop-blur-md rounded-full p-1.5 sm:p-2 border border-white/20">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Say something..."
              maxLength={200}
              className="flex-1 px-3 sm:px-4 py-2 bg-transparent text-white placeholder-white/40 focus:outline-none text-sm sm:text-base"
            />
            <button
              type="submit"
              disabled={!messageInput.trim()}
              className="px-4 sm:px-6 py-2 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold text-sm hover:from-orange-400 hover:to-pink-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🦞 Post
            </button>
          </div>
        </form>
      </div>

      {/* Footer */}
      <footer className="fixed bottom-2 sm:bottom-3 left-0 right-0 text-center">
        <p className="text-[10px] sm:text-xs text-white/30">
          Requested by <span className="text-white/50">@OxPaulius</span> · Built by <span className="text-white/50">@clonkbot</span>
        </p>
      </footer>

      <style>{`
        @keyframes bubble-in {
          0% { transform: translateX(-50%) scale(0); opacity: 0; }
          50% { transform: translateX(-50%) scale(1.1); }
          100% { transform: translateX(-50%) scale(1); opacity: 1; }
        }
        .animate-bubble-in {
          animation: bubble-in 0.3s ease-out forwards;
        }

        @keyframes crab-dance {
          0%, 100% { transform: rotate(-3deg) translateY(0); }
          25% { transform: rotate(3deg) translateY(-2px); }
          50% { transform: rotate(-3deg) translateY(0); }
          75% { transform: rotate(3deg) translateY(-2px); }
        }
        .animate-crab-dance {
          animation: crab-dance 0.5s ease-in-out infinite;
        }

        @keyframes crab-idle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-1px); }
        }
        .animate-crab-idle {
          animation: crab-idle 2s ease-in-out infinite;
        }

        @keyframes claw-left {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-5deg); }
        }
        .animate-claw-left {
          animation: claw-left 1.5s ease-in-out infinite;
          transform-origin: right center;
        }

        @keyframes claw-right {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(5deg); }
        }
        .animate-claw-right {
          animation: claw-right 1.5s ease-in-out infinite;
          transform-origin: left center;
        }

        @keyframes wave {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-wave {
          animation: wave 8s linear infinite;
        }
      `}</style>
    </div>
  );
}

export default function App() {
  return <City />;
}
