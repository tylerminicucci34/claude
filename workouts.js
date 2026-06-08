const WORKOUT_PLANS = {
  muscle: {
    name: "Hypertrophy — Push/Pull/Legs",
    description: "6-day PPL split optimised for muscle growth",
    schedule: "6 days / week",
    color: "#ff6b00",
    days: [
      {
        name: "Push A",
        focus: "Chest · Shoulders · Triceps",
        emoji: "🔴",
        exercises: [
          { name: "Barbell Bench Press",      sets: 4, reps: "8-10",  rest: 90,  note: "Control the eccentric" },
          { name: "Incline Dumbbell Press",   sets: 3, reps: "10-12", rest: 75,  note: "30° incline" },
          { name: "Cable Chest Fly",          sets: 3, reps: "12-15", rest: 60,  note: "Full stretch at bottom" },
          { name: "Overhead Press",           sets: 4, reps: "8-10",  rest: 90,  note: "Bar just in front of head" },
          { name: "Lateral Raises",           sets: 4, reps: "15-20", rest: 60,  note: "Slight forward lean" },
          { name: "Tricep Pushdowns",         sets: 3, reps: "12-15", rest: 60,  note: "Keep elbows pinned" },
          { name: "Overhead Tricep Extension",sets: 3, reps: "12-15", rest: 60,  note: "Full stretch overhead" }
        ]
      },
      {
        name: "Pull A",
        focus: "Back · Biceps · Rear Delts",
        emoji: "🔵",
        exercises: [
          { name: "Deadlift",                 sets: 4, reps: "5-6",   rest: 120, note: "Hip-hinge, brace core" },
          { name: "Pull-Ups",                 sets: 4, reps: "6-10",  rest: 90,  note: "Full hang at bottom" },
          { name: "Barbell Row",              sets: 4, reps: "8-10",  rest: 90,  note: "Chest to bar" },
          { name: "Lat Pulldown",             sets: 3, reps: "12-15", rest: 75,  note: "Drive elbows down" },
          { name: "Face Pulls",               sets: 3, reps: "15-20", rest: 60,  note: "Pull to forehead" },
          { name: "Barbell Curl",             sets: 3, reps: "10-12", rest: 60,  note: "No swinging" },
          { name: "Hammer Curls",             sets: 3, reps: "12-15", rest: 60,  note: "Neutral grip" }
        ]
      },
      {
        name: "Legs A",
        focus: "Quads · Hamstrings · Calves",
        emoji: "🟢",
        exercises: [
          { name: "Back Squat",               sets: 4, reps: "8-10",  rest: 120, note: "Break parallel" },
          { name: "Leg Press",                sets: 3, reps: "12-15", rest: 90,  note: "Full ROM" },
          { name: "Romanian Deadlift",        sets: 3, reps: "10-12", rest: 90,  note: "Feel hamstring stretch" },
          { name: "Leg Curl",                 sets: 3, reps: "12-15", rest: 60,  note: "Pause at peak" },
          { name: "Leg Extension",            sets: 3, reps: "15-20", rest: 60,  note: "Lock out at top" },
          { name: "Standing Calf Raise",      sets: 4, reps: "15-20", rest: 60,  note: "Full stretch at bottom" }
        ]
      },
      {
        name: "Push B",
        focus: "Chest · Shoulders · Triceps",
        emoji: "🔴",
        exercises: [
          { name: "Incline Barbell Press",    sets: 4, reps: "8-10",  rest: 90,  note: "30-45° incline" },
          { name: "DB Shoulder Press",        sets: 4, reps: "10-12", rest: 90,  note: "Don't lock out hard" },
          { name: "Cable Fly (High to Low)",  sets: 3, reps: "12-15", rest: 60,  note: "Lower chest emphasis" },
          { name: "Arnold Press",             sets: 3, reps: "10-12", rest: 75,  note: "Rotate through full ROM" },
          { name: "Rear-delt Fly",            sets: 3, reps: "15-20", rest: 60,  note: "Prone or cable" },
          { name: "Dips (Tricep)",            sets: 3, reps: "10-15", rest: 75,  note: "Upright torso" },
          { name: "Tricep Kickbacks",         sets: 3, reps: "12-15", rest: 60,  note: "Full extension" }
        ]
      },
      {
        name: "Pull B",
        focus: "Back · Biceps · Rear Delts",
        emoji: "🔵",
        exercises: [
          { name: "Rack Pull",                sets: 4, reps: "5-6",   rest: 120, note: "Just below knee" },
          { name: "Weighted Pull-Ups",        sets: 4, reps: "6-8",   rest: 90,  note: "Add belt weight" },
          { name: "T-Bar Row",                sets: 4, reps: "10-12", rest: 90,  note: "Chest pad supported" },
          { name: "Single-Arm DB Row",        sets: 3, reps: "12-15", rest: 60,  note: "Elbow back, not out" },
          { name: "Straight-Arm Pulldown",    sets: 3, reps: "12-15", rest: 60,  note: "Lats only" },
          { name: "Preacher Curl",            sets: 3, reps: "10-12", rest: 60,  note: "Slow down, slow up" },
          { name: "Incline DB Curl",          sets: 3, reps: "12-15", rest: 60,  note: "Full stretch at bottom" }
        ]
      },
      {
        name: "Legs B",
        focus: "Quads · Glutes · Hamstrings",
        emoji: "🟢",
        exercises: [
          { name: "Front Squat",              sets: 4, reps: "8-10",  rest: 120, note: "Elbows high" },
          { name: "Hack Squat",               sets: 3, reps: "12-15", rest: 90,  note: "Feet low on plate" },
          { name: "Hip Thrust",               sets: 4, reps: "10-12", rest: 90,  note: "Drive hips to ceiling" },
          { name: "Lying Leg Curl",           sets: 3, reps: "12-15", rest: 60,  note: "Plantar-flex toes" },
          { name: "Bulgarian Split Squat",    sets: 3, reps: "10-12", rest: 75,  note: "Each leg" },
          { name: "Seated Calf Raise",        sets: 4, reps: "15-20", rest: 60,  note: "Full ROM, slow" }
        ]
      }
    ]
  },

  strength: {
    name: "Powerbuilding — 4-Day",
    description: "Strength-focused with compound heavy lifts",
    schedule: "4 days / week",
    color: "#cc00ff",
    days: [
      {
        name: "Squat Day",
        focus: "Squat · Quad · Posterior Chain",
        emoji: "🟣",
        exercises: [
          { name: "Back Squat",               sets: 5, reps: "3-5",   rest: 180, note: "Heavy — 85-90% 1RM" },
          { name: "Pause Squat",              sets: 3, reps: "3",     rest: 120, note: "2-sec pause at bottom" },
          { name: "Front Squat",              sets: 3, reps: "5",     rest: 120, note: "70% 1RM" },
          { name: "Leg Press",                sets: 3, reps: "8-10",  rest: 90,  note: "Accessory volume" },
          { name: "Leg Curl",                 sets: 3, reps: "10-12", rest: 75,  note: "Hamstring health" },
          { name: "Ab Wheel Rollout",         sets: 3, reps: "10-15", rest: 60,  note: "Core for bracing" }
        ]
      },
      {
        name: "Bench Day",
        focus: "Bench · Chest · Triceps",
        emoji: "🟣",
        exercises: [
          { name: "Barbell Bench Press",      sets: 5, reps: "3-5",   rest: 180, note: "Heavy — 85-90% 1RM" },
          { name: "Close-Grip Bench",         sets: 3, reps: "5-6",   rest: 120, note: "Tricep strength" },
          { name: "Dumbbell Press",           sets: 3, reps: "8-10",  rest: 90,  note: "Hypertrophy accessory" },
          { name: "Overhead Press",           sets: 3, reps: "6-8",   rest: 90,  note: "Shoulder strength" },
          { name: "Lateral Raises",           sets: 3, reps: "15",    rest: 60,  note: "Side delt health" },
          { name: "Tricep Pushdown",          sets: 3, reps: "12-15", rest: 60,  note: "Elbow extension lockout" }
        ]
      },
      {
        name: "Deadlift Day",
        focus: "Deadlift · Back · Hamstrings",
        emoji: "🟣",
        exercises: [
          { name: "Deadlift",                 sets: 5, reps: "3-5",   rest: 180, note: "Heavy — 85-90% 1RM" },
          { name: "Romanian Deadlift",        sets: 3, reps: "6-8",   rest: 120, note: "Hamstring accessory" },
          { name: "Barbell Row",              sets: 4, reps: "6-8",   rest: 90,  note: "Upper back strength" },
          { name: "Weighted Pull-Ups",        sets: 3, reps: "5-8",   rest: 90,  note: "Lat strength" },
          { name: "Barbell Shrug",            sets: 3, reps: "10-12", rest: 75,  note: "Trap development" },
          { name: "Barbell Curl",             sets: 3, reps: "10-12", rest: 60,  note: "Elbow health" }
        ]
      },
      {
        name: "Press Day",
        focus: "OHP · Shoulders · Upper Back",
        emoji: "🟣",
        exercises: [
          { name: "Overhead Press",           sets: 5, reps: "3-5",   rest: 180, note: "Heavy — 85-90% 1RM" },
          { name: "Push Press",               sets: 3, reps: "3-5",   rest: 120, note: "Drive with legs" },
          { name: "Incline Bench Press",      sets: 3, reps: "8-10",  rest: 90,  note: "Bench accessory" },
          { name: "Face Pulls",               sets: 4, reps: "15-20", rest: 60,  note: "Shoulder health" },
          { name: "Rear-Delt Fly",            sets: 3, reps: "15",    rest: 60,  note: "Posture + rear delts" },
          { name: "Tricep Overhead Extension",sets: 3, reps: "12-15", rest: 60,  note: "Long head" }
        ]
      }
    ]
  },

  fat: {
    name: "Fat Loss Circuit — 4-Day",
    description: "High-intensity circuits to maximise calorie burn",
    schedule: "4 days / week",
    color: "#ff3366",
    days: [
      {
        name: "Circuit A",
        focus: "Full Body · Metabolic",
        emoji: "🔥",
        exercises: [
          { name: "Goblet Squat",             sets: 4, reps: "15",    rest: 30,  note: "Minimal rest" },
          { name: "Push-Ups",                 sets: 4, reps: "15-20", rest: 30,  note: "Full lockout" },
          { name: "KB Swing",                 sets: 4, reps: "20",    rest: 30,  note: "Hip snap" },
          { name: "Dumbbell Row",             sets: 4, reps: "15",    rest: 30,  note: "Each arm" },
          { name: "Jumping Jacks",            sets: 3, reps: "30",    rest: 15,  note: "Cardio filler" },
          { name: "Mountain Climbers",        sets: 3, reps: "30s",   rest: 15,  note: "Fast pace" },
          { name: "Plank",                    sets: 3, reps: "45s",   rest: 30,  note: "Hold steady" }
        ]
      },
      {
        name: "HIIT Cardio",
        focus: "Cardio · Fat Burn",
        emoji: "🔥",
        exercises: [
          { name: "Warm-Up Walk/Jog",         sets: 1, reps: "5min",  rest: 0,   note: "Easy pace" },
          { name: "Sprint Interval",          sets: 8, reps: "30s",   rest: 90,  note: "90% max effort" },
          { name: "Jump Rope",                sets: 5, reps: "60s",   rest: 30,  note: "Steady rhythm" },
          { name: "Box Jumps",                sets: 4, reps: "10",    rest: 60,  note: "Land softly" },
          { name: "Burpees",                  sets: 4, reps: "10",    rest: 45,  note: "Full extension overhead" },
          { name: "Cool-Down Walk",           sets: 1, reps: "5min",  rest: 0,   note: "Bring HR down" }
        ]
      },
      {
        name: "Circuit B",
        focus: "Full Body · Strength-Cardio",
        emoji: "🔥",
        exercises: [
          { name: "Deadlift",                 sets: 4, reps: "10-12", rest: 60,  note: "Moderate weight" },
          { name: "Dumbbell Push Press",      sets: 4, reps: "12",    rest: 45,  note: "Explosive up" },
          { name: "Bent-Over Row",            sets: 4, reps: "12",    rest: 45,  note: "Controlled" },
          { name: "Walking Lunges",           sets: 3, reps: "20",    rest: 45,  note: "10 each leg" },
          { name: "Lateral Raises",           sets: 3, reps: "15",    rest: 30,  note: "Light weight" },
          { name: "Bicycle Crunches",         sets: 3, reps: "20",    rest: 30,  note: "Slow & controlled" },
          { name: "Jump Squats",              sets: 3, reps: "15",    rest: 45,  note: "Explosive" }
        ]
      },
      {
        name: "Active Recovery",
        focus: "Cardio · Mobility",
        emoji: "🔥",
        exercises: [
          { name: "Steady-State Cardio",      sets: 1, reps: "30min", rest: 0,   note: "60-70% max HR" },
          { name: "Hip Flexor Stretch",       sets: 2, reps: "60s",   rest: 30,  note: "Each side" },
          { name: "Foam Roll — Quads",        sets: 1, reps: "90s",   rest: 0,   note: "Slow rolls" },
          { name: "Foam Roll — Hamstrings",   sets: 1, reps: "90s",   rest: 0,   note: "Slow rolls" },
          { name: "Cat-Cow Stretch",          sets: 2, reps: "10",    rest: 30,  note: "Breathe through" },
          { name: "Child's Pose",             sets: 2, reps: "60s",   rest: 30,  note: "Full relaxation" }
        ]
      }
    ]
  },

  endurance: {
    name: "Endurance Builder — 5-Day",
    description: "Cardio + functional strength for peak stamina",
    schedule: "5 days / week",
    color: "#00d4ff",
    days: [
      {
        name: "Easy Run",
        focus: "Aerobic Base · Zone 2",
        emoji: "🏃",
        exercises: [
          { name: "Warm-Up Walk",             sets: 1, reps: "5min",  rest: 0,   note: "Loosen legs" },
          { name: "Easy-Pace Run",            sets: 1, reps: "30min", rest: 0,   note: "Can hold conversation" },
          { name: "Cool-Down Walk",           sets: 1, reps: "5min",  rest: 0,   note: "Gradually slow" },
          { name: "Standing Calf Raises",     sets: 2, reps: "20",    rest: 30,  note: "Runner's accessory" },
          { name: "Hip Flexor Stretch",       sets: 2, reps: "60s",   rest: 0,   note: "Each side" }
        ]
      },
      {
        name: "Core + Strength",
        focus: "Functional Strength · Core",
        emoji: "🏃",
        exercises: [
          { name: "Dead Bug",                 sets: 3, reps: "10",    rest: 45,  note: "Slow, controlled" },
          { name: "Plank Variations",         sets: 3, reps: "45s",   rest: 30,  note: "Front, L, R" },
          { name: "Glute Bridge",             sets: 3, reps: "15",    rest: 45,  note: "Squeeze at top" },
          { name: "Single-Leg Deadlift",      sets: 3, reps: "10",    rest: 60,  note: "Balance + hamstring" },
          { name: "Push-Ups",                 sets: 3, reps: "15",    rest: 45,  note: "Upper body base" },
          { name: "Band Pull-Apart",          sets: 3, reps: "20",    rest: 30,  note: "Posture & shoulders" }
        ]
      },
      {
        name: "Cross-Training",
        focus: "Cycling / Rowing / Swimming",
        emoji: "🏃",
        exercises: [
          { name: "Warm-Up (Easy)",           sets: 1, reps: "5min",  rest: 0,   note: "Low intensity" },
          { name: "Bike / Row / Swim",        sets: 1, reps: "35min", rest: 0,   note: "Steady effort" },
          { name: "Cool-Down",                sets: 1, reps: "5min",  rest: 0,   note: "Slow down" },
          { name: "Hamstring Stretch",        sets: 2, reps: "60s",   rest: 0,   note: "Each side" },
          { name: "Pigeon Pose",              sets: 2, reps: "60s",   rest: 0,   note: "Hip flexor / glute" }
        ]
      },
      {
        name: "Intervals",
        focus: "Speed · VO₂ Max",
        emoji: "🏃",
        exercises: [
          { name: "Warm-Up Jog",              sets: 1, reps: "10min", rest: 0,   note: "Easy pace" },
          { name: "Hard Run Interval",        sets: 6, reps: "400m",  rest: 90,  note: "Hard effort ~85% HR" },
          { name: "Jog Recovery",             sets: 6, reps: "400m",  rest: 0,   note: "Between intervals" },
          { name: "Cool-Down Jog",            sets: 1, reps: "10min", rest: 0,   note: "Easy pace" },
          { name: "Standing Quad Stretch",    sets: 2, reps: "45s",   rest: 0,   note: "Each side" }
        ]
      },
      {
        name: "Long Effort",
        focus: "Distance · Stamina",
        emoji: "🏃",
        exercises: [
          { name: "Warm-Up Walk",             sets: 1, reps: "5min",  rest: 0,   note: "Ease in" },
          { name: "Long Run / Row / Bike",    sets: 1, reps: "60min", rest: 0,   note: "Comfortable Zone 2" },
          { name: "Cool-Down Walk",           sets: 1, reps: "10min", rest: 0,   note: "Full cooldown" },
          { name: "Full-Body Stretch",        sets: 1, reps: "10min", rest: 0,   note: "Hit all major groups" }
        ]
      }
    ]
  },

  general: {
    name: "General Fitness — 3-Day",
    description: "Balanced full-body training for overall health",
    schedule: "3 days / week",
    color: "#00ff88",
    days: [
      {
        name: "Full Body A",
        focus: "Balanced Strength",
        emoji: "⚡",
        exercises: [
          { name: "Goblet Squat",             sets: 3, reps: "10-12", rest: 75,  note: "Great for beginners" },
          { name: "Dumbbell Bench Press",     sets: 3, reps: "10-12", rest: 75,  note: "Control both ways" },
          { name: "Dumbbell Row",             sets: 3, reps: "10-12", rest: 75,  note: "Each arm" },
          { name: "Dumbbell Curl",            sets: 3, reps: "12-15", rest: 60,  note: "Squeeze at top" },
          { name: "Tricep Pushdown",          sets: 3, reps: "12-15", rest: 60,  note: "Keep elbows still" },
          { name: "Plank",                    sets: 3, reps: "30s",   rest: 45,  note: "Core stability" }
        ]
      },
      {
        name: "Full Body B",
        focus: "Lower Body + Pull",
        emoji: "⚡",
        exercises: [
          { name: "Deadlift (or RDL)",        sets: 3, reps: "8-10",  rest: 90,  note: "Hip hinge pattern" },
          { name: "Overhead Press",           sets: 3, reps: "10-12", rest: 75,  note: "Core stays tight" },
          { name: "Pull-Ups / Lat Pulldown",  sets: 3, reps: "8-12",  rest: 75,  note: "Full ROM" },
          { name: "Walking Lunges",           sets: 3, reps: "12",    rest: 60,  note: "Each leg" },
          { name: "Lateral Raises",           sets: 3, reps: "15",    rest: 60,  note: "Light weight" },
          { name: "Ab Rollout / Crunch",      sets: 3, reps: "12-15", rest: 45,  note: "Core finish" }
        ]
      },
      {
        name: "Full Body C",
        focus: "Cardio + Core Strength",
        emoji: "⚡",
        exercises: [
          { name: "Jump Rope / Jog",          sets: 1, reps: "10min", rest: 0,   note: "Warm-up cardio" },
          { name: "Squat Variation",          sets: 3, reps: "12-15", rest: 60,  note: "Front squat or split" },
          { name: "Push-Up Variation",        sets: 3, reps: "15",    rest: 60,  note: "Wide, close, or decline" },
          { name: "Inverted Row / Band Row",  sets: 3, reps: "12-15", rest: 60,  note: "Bodyweight option" },
          { name: "Side Plank",               sets: 3, reps: "30s",   rest: 30,  note: "Each side" },
          { name: "Mountain Climbers",        sets: 3, reps: "20",    rest: 45,  note: "Explosive cardio" }
        ]
      }
    ]
  }
};

const GOAL_INFO = {
  muscle:    { label: "Build Muscle",     icon: "💪", target: "Increase muscle size & definition" },
  strength:  { label: "Get Stronger",     icon: "🏋️", target: "Increase 1RM on compound lifts" },
  fat:       { label: "Lose Fat",         icon: "🔥", target: "Reduce body fat percentage" },
  endurance: { label: "Boost Endurance",  icon: "🏃", target: "Improve cardiovascular stamina" },
  general:   { label: "General Fitness",  icon: "⚡", target: "Improve overall health & fitness" }
};

const INTENSITY_LABELS = [
  "", "Very Easy", "Easy", "Moderate",
  "Somewhat Hard", "Hard", "Hard",
  "Very Hard", "Very Hard", "Max Effort", "Absolute Max"
];

const INTENSITY_TIPS = [
  "", "Just moving — warm up or recovery",
  "Light effort, easy breathing",
  "Can hold a conversation",
  "Starting to breathe harder",
  "Challenging but sustainable",
  "Pushing your limits",
  "Very difficult — short bursts only",
  "Near maximum output",
  "One more rep impossible",
  "True max — everything you have"
];
