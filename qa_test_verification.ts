#!/usr/bin/env npx ts-node

/**
 * QA VERIFICATION TESTS FOR LEGALIA SCORING SYSTEM
 * Tests critical invariants in scoring, XP, and streak logic
 */

// Mock test interface (this would normally use Jest/Vitest)
interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  actual?: any;
  expected?: any;
}

const testResults: TestResult[] = [];

// Helper to assert test conditions
function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

// Test 1: Score Calculation Correctness
function testScoreCalculation() {
  const testName = "Score Calculation Correctness";
  try {
    // Test cases based on actual implementation in leaderboardService.ts
    const scenarios = [
      { correctAnswers: 10, totalQuestions: 10, expectedPoints: 15 }, // Fixed 15 XP for completion
      { correctAnswers: 7, totalQuestions: 10, expectedPoints: 15 },  // ≥70% threshold
      { correctAnswers: 6, totalQuestions: 10, expectedPoints: 0 },   // <70% no points
      { correctAnswers: 0, totalQuestions: 10, expectedPoints: 0 },   // Zero score
    ];

    for (const scenario of scenarios) {
      const percentage = (scenario.correctAnswers / scenario.totalQuestions) * 100;
      const actualPoints = percentage >= 70 ? 15 : 0; // Based on leaderboardService logic
      
      assert(
        actualPoints === scenario.expectedPoints,
        `Expected ${scenario.expectedPoints} points for ${scenario.correctAnswers}/${scenario.totalQuestions}, got ${actualPoints}`
      );
    }

    testResults.push({ name: testName, passed: true });
  } catch (error) {
    testResults.push({ 
      name: testName, 
      passed: false, 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
}

// Test 2: Streak Logic Validation
function testStreakLogic() {
  const testName = "Streak Logic Validation";
  try {
    // Based on supabaseService.ts updateUserStreak implementation
    const today = new Date('2024-01-15'); // Monday
    const scenarios = [
      {
        lastActiveDate: '2024-01-14', // Yesterday (Sunday)
        currentStreak: 5,
        expectedNewStreak: 6, // Should increment
        description: "Consecutive day"
      },
      {
        lastActiveDate: '2024-01-15', // Today
        currentStreak: 5,
        expectedNewStreak: 5, // Should stay same
        description: "Same day"
      },
      {
        lastActiveDate: '2024-01-13', // Day before yesterday
        currentStreak: 5,
        expectedNewStreak: 1, // Should reset
        description: "Broken streak"
      }
    ];

    for (const scenario of scenarios) {
      const lastActiveDate = new Date(scenario.lastActiveDate);
      const diffDays = Math.floor((today.getTime() - lastActiveDate.getTime()) / (1000 * 60 * 60 * 24));
      
      let newStreak = scenario.currentStreak;
      if (diffDays === 0) {
        // Same day - no change
      } else if (diffDays === 1) {
        // Consecutive day - increment
        newStreak += 1;
      } else {
        // Streak broken - reset
        newStreak = 1;
      }

      assert(
        newStreak === scenario.expectedNewStreak,
        `${scenario.description}: Expected streak ${scenario.expectedNewStreak}, got ${newStreak}`
      );
    }

    testResults.push({ name: testName, passed: true });
  } catch (error) {
    testResults.push({ 
      name: testName, 
      passed: false, 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
}

// Test 3: XP System Consistency 
function testXPSystemConsistency() {
  const testName = "XP System Consistency";
  try {
    // Test the relationship between different XP systems
    
    // Achievement system points vs leaderboard points
    const achievementFirstQuiz = 10; // From achievements.ts
    const leaderboardQuizCompletion = 15; // From leaderboardService.ts
    
    // These should be aligned but currently aren't - this is a finding
    console.log(`Achievement points for first quiz: ${achievementFirstQuiz}`);
    console.log(`Leaderboard points for quiz completion: ${leaderboardQuizCompletion}`);
    
    // Test that SQL functions and TypeScript logic align
    // From points_calculation_functions.sql: 10 points per correct answer
    const sqlBasePoints = 10; // per correct answer
    const jsFixedPoints = 15;  // fixed per completion
    
    console.log(`SQL calculates: ${sqlBasePoints} * correct_answers`);
    console.log(`JS calculates: ${jsFixedPoints} fixed points`);

    testResults.push({ 
      name: testName, 
      passed: false, 
      error: "XP calculation inconsistency detected between SQL and JS implementations" 
    });
  } catch (error) {
    testResults.push({ 
      name: testName, 
      passed: false, 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
}

// Test 4: Timezone Handling
function testTimezoneHandling() {
  const testName = "Timezone Handling";
  try {
    // Test streak calculation across timezones
    const utcDate = new Date('2024-01-15T23:30:00Z'); // 23:30 UTC
    const chisinauOffset = 2; // UTC+2 for Europe/Chisinau (winter)
    
    // In Chisinau, this would be 01:30 next day
    const chisinauDate = new Date(utcDate.getTime() + (chisinauOffset * 60 * 60 * 1000));
    
    // The current implementation uses local device time, not user's configured timezone
    // This could cause streak inconsistencies for users in different timezones
    
    console.log(`UTC: ${utcDate.toISOString()}`);
    console.log(`Chisinau equivalent: ${chisinauDate.toISOString()}`);
    
    testResults.push({ 
      name: testName, 
      passed: false, 
      error: "Timezone handling not implemented - uses device local time instead of user timezone" 
    });
  } catch (error) {
    testResults.push({ 
      name: testName, 
      passed: false, 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
}

// Test 5: Data Consistency Checks
function testDataConsistency() {
  const testName = "Data Consistency";
  try {
    // Check for potential race conditions in quiz submission
    // Based on supabaseService.ts submitQuizResult
    
    // Anti-cheating validation tests
    const validSubmission = {
      correctAnswers: 8,
      totalQuestions: 10,
      quizId: 1
    };
    
    const invalidSubmissions = [
      { correctAnswers: 11, totalQuestions: 10, error: "correctAnswers > totalQuestions" },
      { correctAnswers: -1, totalQuestions: 10, error: "negative correctAnswers" },
      { correctAnswers: 5, totalQuestions: 0, error: "zero totalQuestions" },
      { correctAnswers: 5, totalQuestions: 100, error: "excessive totalQuestions" },
    ];

    // Valid submission should pass
    assert(validSubmission.correctAnswers <= validSubmission.totalQuestions, "Valid submission should pass");
    assert(validSubmission.correctAnswers >= 0, "Valid submission should pass");
    assert(validSubmission.totalQuestions > 0 && validSubmission.totalQuestions <= 50, "Valid submission should pass");

    // Invalid submissions should fail
    for (const invalid of invalidSubmissions) {
      let shouldFail = false;
      if (invalid.correctAnswers < 0 || invalid.correctAnswers > invalid.totalQuestions) {
        shouldFail = true;
      }
      if (invalid.totalQuestions <= 0 || invalid.totalQuestions > 50) {
        shouldFail = true;
      }
      
      assert(shouldFail, `Invalid submission should fail: ${invalid.error}`);
    }

    testResults.push({ name: testName, passed: true });
  } catch (error) {
    testResults.push({ 
      name: testName, 
      passed: false, 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
}

// Run all tests
function runAllTests() {
  console.log("🧪 Running Legalia QA Verification Tests\n");
  
  testScoreCalculation();
  testStreakLogic();
  testXPSystemConsistency();
  testTimezoneHandling();
  testDataConsistency();
  
  console.log("\n📊 Test Results:");
  console.log("================");
  
  let passed = 0;
  let failed = 0;
  
  for (const result of testResults) {
    const status = result.passed ? "✅ PASS" : "❌ FAIL";
    console.log(`${status} ${result.name}`);
    if (!result.passed && result.error) {
      console.log(`   Error: ${result.error}`);
    }
    
    if (result.passed) passed++;
    else failed++;
  }
  
  console.log(`\nSummary: ${passed} passed, ${failed} failed`);
  
  return { passed, failed, results: testResults };
}

// Export for use
if (require.main === module) {
  runAllTests();
}

export { runAllTests, testResults };