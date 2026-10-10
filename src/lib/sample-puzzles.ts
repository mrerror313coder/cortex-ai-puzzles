import { WordDefinition } from "./engines/crossword";

export const THEMATIC_CROSSWORD_BANKS: Record<string, WordDefinition[]> = {
  "AI & Future Tech": [
    { word: "NEURAL", clue: "Network modeled after the human brain structure" },
    { word: "ROBOT", clue: "Autonomous electro-mechanical agent" },
    { word: "ALGORITHM", clue: "Step-by-step mathematical recipe to solve a problem" },
    { word: "DATA", clue: "The fuel of machine learning models" },
    { word: "AGENT", clue: "Autonomous AI entity capable of taking actions" },
    { word: "TENSOR", clue: "Multi-dimensional mathematical array structure" },
    { word: "PROMPT", clue: "Input instructions passed to a generative model" },
    { word: "LOGIC", clue: "Formal rules of deductive reasoning" },
  ],
  "Deep Space Exploration": [
    { word: "GALAXY", clue: "Vast cosmic system of billions of stars and nebulae" },
    { word: "ORBIT", clue: "Gravitationally curved trajectory around a celestial body" },
    { word: "PLANET", clue: "Celestial body orbiting a star" },
    { word: "NEBULA", clue: "Interstellar cloud of dust and radiant gases" },
    { word: "PULSAR", clue: "Rapidly rotating neutron star emitting beams" },
    { word: "COMET", clue: "Icy small solar system body with a radiant tail" },
    { word: "ASTRONAUT", clue: "Explorer trained to travel into outer space" },
  ],
  "Cyberpunk 2099": [
    { word: "CYBORG", clue: "Being with both organic and biomechatronic body parts" },
    { word: "MATRIX", clue: "Virtual reality simulation network" },
    { word: "NEON", clue: "Glow in the dense night of a futuristic megacity" },
    { word: "HACKER", clue: "Digital renegade infiltrating corporate mainframes" },
    { word: "SYNTH", clue: "Electronic synthesizer or synthetic entity" },
    { word: "DRONE", clue: "Unmanned aerial surveillance craft" },
  ],
};

export const THEMATIC_WORDSEARCH_BANKS: Record<string, string[]> = {
  "AI & Machine Learning": [
    "NEURAL", "TRANSFORMER", "WEIGHTS", "TOKENS", "GRADIENT",
    "PYTHON", "DATASET", "ALGORITHM", "INFERENCE", "EMBEDDING"
  ],
  "Cosmic Horizons": [
    "SUPERNOVA", "QUASAR", "GRAVITY", "ECLIPSE", "METEOR",
    "ANDROMEDA", "TELESCOPE", "ASTRONOMY", "COSMOS", "PHOTON"
  ],
  "Cyberpunk Megacity": [
    "CYBERSPACE", "AUGMENTED", "HOLOGRAM", "INTERFACE", "GLITCH",
    "MAINFRAME", "CIRCUIT", "NETRUNNER", "SYNAPSE", "CRYPTO"
  ],
  "Ancient Mysteries": [
    "PYRAMID", "HIEROGLYPH", "OBELISK", "PHARAOH", "TEMPLE",
    "ARTIFACT", "PARCHMENT", "LABYRINTH", "ORACLE", "SPHINX"
  ],
};
