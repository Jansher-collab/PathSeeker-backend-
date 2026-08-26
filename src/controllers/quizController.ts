import { Request, Response } from 'express';
import { QuizQuestion } from '../models/QuizQuestion';
import { User } from '../models/User';
import { mockQuizQuestions, mockCareers, mockUsers } from '../seed/seedData';
import { AuthRequest } from '../middleware/auth';

// 1. Get All Quiz Questions
export const getQuizQuestions = async (req: Request, res: Response): Promise<void> => {
  try {
    let questions: any[] = [];
    try {
      questions = await QuizQuestion.find().sort({ order: 1 });
    } catch (e) {
      questions = mockQuizQuestions;
    }

    if (!questions || questions.length === 0) {
      questions = mockQuizQuestions;
    }

    res.status(200).json({
      success: true,
      count: questions.length,
      questions,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Submit Quiz & Generate Personalized Career Streams
export const submitQuiz = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { answers } = req.body; // Array of { questionId, scoreValue, category, domains }

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      res.status(400).json({ success: false, message: 'Please provide valid quiz answers.' });
      return;
    }

    // Tally RIASEC + Tech Category Scores
    const hollandScores = {
      realistic: 50,
      investigative: 50,
      artistic: 50,
      social: 50,
      enterprising: 50,
      conventional: 50,
    };

    let totalScoreSum = 0;
    const domainAffinities: Record<string, number> = {};

    answers.forEach((ans: any) => {
      totalScoreSum += ans.scoreValue || 3;
      if (ans.category) {
        const cat = ans.category.toLowerCase();
        if (cat.includes('investigat')) hollandScores.investigative += ans.scoreValue * 8;
        if (cat.includes('realist')) hollandScores.realistic += ans.scoreValue * 8;
        if (cat.includes('artist')) hollandScores.artistic += ans.scoreValue * 8;
        if (cat.includes('social')) hollandScores.social += ans.scoreValue * 8;
        if (cat.includes('enterpris')) hollandScores.enterprising += ans.scoreValue * 8;
        if (cat.includes('convention')) hollandScores.conventional += ans.scoreValue * 8;
      }
      if (ans.domains && Array.isArray(ans.domains)) {
        ans.domains.forEach((d: string) => {
          domainAffinities[d] = (domainAffinities[d] || 0) + (ans.scoreValue || 1);
        });
      }
    });

    // Normalize holland scores to 0-100
    Object.keys(hollandScores).forEach((k) => {
      (hollandScores as any)[k] = Math.min(98, Math.max(35, (hollandScores as any)[k]));
    });

    // Score overall percentage
    const maxPossible = answers.length * 5;
    const overallScore = Math.min(99, Math.round((totalScoreSum / maxPossible) * 100));

    // Recommend top 3 Careers based on scores
    const recommendedCareers = mockCareers
      .map((c) => {
        let matchScore = 70;
        if (hollandScores.investigative > 70 && (c.domain === 'Software Engineering' || c.domain === 'Artificial Intelligence')) {
          matchScore += 22;
        }
        if (hollandScores.artistic > 70 && c.domain === 'Product & Design') {
          matchScore += 25;
        }
        if (hollandScores.realistic > 70 && (c.domain === 'Cloud & Infrastructure' || c.domain === 'Security & Intelligence')) {
          matchScore += 20;
        }
        return {
          career: c,
          matchPercentage: Math.min(98, matchScore + Math.floor(Math.random() * 6)),
        };
      })
      .sort((a, b) => b.matchPercentage - a.matchPercentage)
      .slice(0, 3);

    // Generate Visa Stamp award
    const newVisaStamp = {
      id: `stamp-quiz-${Date.now()}`,
      title: 'Career Navigator Visa',
      category: 'Assessment',
      icon: 'FaCompassDrafting',
      tier: 'Silver' as const,
      unlockedAt: new Date(),
      description: `Completed comprehensive AI Career Aptitude Assessment with ${overallScore}% aptitude index.`,
      code: `NAV-${Math.floor(100 + Math.random() * 900)}`,
    };

    const quizRecord = {
      quizId: `quiz-${Date.now()}`,
      score: overallScore,
      hollandScores,
      recommendedCareers: recommendedCareers.map((r) => r.career.title),
      completedAt: new Date(),
    };

    // If authenticated, persist to user profile
    if (req.user) {
      try {
        await User.findByIdAndUpdate(req.user._id, {
          $push: {
            quizHistory: quizRecord,
            visaStamps: newVisaStamp,
          },
        });
      } catch (e) {
        // Fallback in-memory
        const found = mockUsers.find((u) => u._id === req.user._id.toString());
        if (found) {
          found.quizHistory.unshift(quizRecord);
          // Check if already has navigator stamp
          if (!found.visaStamps.some((s: any) => s.title.includes('Navigator'))) {
            found.visaStamps.push(newVisaStamp);
          }
        }
      }
    }

    res.status(200).json({
      success: true,
      message: 'Quiz assessment completed successfully!',
      result: {
        score: overallScore,
        hollandScores,
        recommendedCareers,
        awardedStamp: newVisaStamp,
        completedAt: new Date(),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Get User Quiz History
export const getQuizHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const history = req.user?.quizHistory || [];
    res.status(200).json({
      success: true,
      count: history.length,
      history,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
