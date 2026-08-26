import { Router } from 'express';
import {
  roastResume,
  getMockInterview,
  evaluateMockAnswer,
  chatVirtualAdvisor,
  getVoiceMentorScript,
  simulateMarketShift,
} from '../controllers/aiController';

const router = Router();

router.post('/resume-roast', roastResume);
router.get('/mock-interview', getMockInterview);
router.post('/evaluate-answer', evaluateMockAnswer);
router.post('/advisor-chat', chatVirtualAdvisor);
router.get('/voice-script', getVoiceMentorScript);
router.get('/market-shift', simulateMarketShift);

export default router;
