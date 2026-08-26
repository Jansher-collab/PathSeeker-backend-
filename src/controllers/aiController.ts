import { Request, Response } from 'express';
import { aiService } from '../services/aiService';
import { AuthRequest } from '../middleware/auth';

// 1. AI Resume Roaster & "Brutal Roast & Fix" Analyzer
export const roastResume = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { resumeText, targetRole = 'Full Stack Developer' } = req.body;

    if (!resumeText || typeof resumeText !== 'string' || resumeText.trim().length < 20) {
      res.status(400).json({
        success: false,
        message: 'Please provide valid resume text (at least 20 characters) or upload a resume.',
      });
      return;
    }

    const roastReport = aiService.analyzeAndRoastResume(resumeText, targetRole);
    const mockInterview = aiService.generateMockInterviewQuestions(targetRole);

    res.status(200).json({
      success: true,
      targetRole,
      report: roastReport,
      mockInterviewQuestions: mockInterview,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Get 3-Question AI Mock Interview for Target Role
export const getMockInterview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { targetRole = 'Full Stack Developer' } = req.query;
    const questions = aiService.generateMockInterviewQuestions(targetRole as string);

    res.status(200).json({
      success: true,
      targetRole,
      count: questions.length,
      questions,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Evaluate Single Mock Interview Answer
export const evaluateMockAnswer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { question, answer, targetRole = 'Full Stack Developer' } = req.body;

    if (!question || !answer) {
      res.status(400).json({ success: false, message: 'Please provide both the question and your response.' });
      return;
    }

    const evaluation = aiService.evaluateInterviewAnswer(question, answer, targetRole);

    res.status(200).json({
      success: true,
      evaluation,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. PathSeeker Virtual Advisor (Floating Conversational AI Assistant)
export const chatVirtualAdvisor = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { message, contextCareer } = req.body;

    if (!message) {
      res.status(400).json({ success: false, message: 'Please enter a message.' });
      return;
    }

    const userRole = req.user?.role || 'Student';
    const response = aiService.askVirtualAdvisor(message, userRole, contextCareer);

    res.status(200).json({
      success: true,
      ...response,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 5. AI Mentor Voice Synthesis Script
export const getVoiceMentorScript = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { careerTitle = 'Software Engineering' } = req.query;
    const userRole = req.user?.role || 'Explorer';
    const script = aiService.generateVoiceMentorPepTalk(careerTitle as string, userRole);

    res.status(200).json({
      success: true,
      careerTitle,
      script,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 6. Predictive Salary & Market Shift Simulator
export const simulateMarketShift = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug = 'full-stack-developer', year = 2026 } = req.query;
    const simulation = aiService.calculateMarketShift(slug as string, Number(year));

    res.status(200).json({
      success: true,
      simulation,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
