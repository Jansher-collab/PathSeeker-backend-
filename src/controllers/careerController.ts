import { Request, Response } from 'express';
import { Career } from '../models/Career';
import { mockCareers } from '../seed/seedData';
import { aiService } from '../services/aiService';

// 1. Get All Careers with Multi-Level Filters & Smart Search
export const getAllCareers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { domain, search, demand, minSalary, maxSalary, sort, limit = 50 } = req.query;

    let careers: any[] = [];

    try {
      const queryObj: any = {};

      if (domain && domain !== 'All') {
        queryObj.domain = domain;
      }
      if (demand && demand !== 'All') {
        queryObj.jobDemand = demand;
      }
      if (minSalary || maxSalary) {
        queryObj['salaryRange.median'] = {};
        if (minSalary) queryObj['salaryRange.median'].$gte = Number(minSalary);
        if (maxSalary) queryObj['salaryRange.median'].$lte = Number(maxSalary);
      }
      if (search) {
        queryObj.$or = [
          { title: { $regex: search, $options: 'i' } },
          { domain: { $regex: search, $options: 'i' } },
          { shortDescription: { $regex: search, $options: 'i' } },
          { 'requiredSkills.name': { $regex: search, $options: 'i' } },
        ];
      }

      let query = Career.find(queryObj);

      if (sort === 'salary_desc') query = query.sort({ 'salaryRange.median': -1 });
      else if (sort === 'salary_asc') query = query.sort({ 'salaryRange.median': 1 });
      else if (sort === 'popular') query = query.sort({ viewsCount: -1, bookmarksCount: -1 });
      else query = query.sort({ createdAt: -1 });

      careers = await query.limit(Number(limit));
    } catch (e) {
      // In-Memory Fallback Filter
      careers = mockCareers.filter((c) => {
        if (domain && domain !== 'All' && c.domain !== domain) return false;
        if (demand && demand !== 'All' && c.jobDemand !== demand) return false;
        if (minSalary && c.salaryRange.median < Number(minSalary)) return false;
        if (maxSalary && c.salaryRange.median > Number(maxSalary)) return false;
        if (search) {
          const s = (search as string).toLowerCase();
          const matchTitle = c.title.toLowerCase().includes(s);
          const matchDomain = c.domain.toLowerCase().includes(s);
          const matchDesc = c.shortDescription.toLowerCase().includes(s);
          const matchSkill = c.requiredSkills.some((sk: any) => sk.name.toLowerCase().includes(s));
          if (!matchTitle && !matchDomain && !matchDesc && !matchSkill) return false;
        }
        return true;
      });

      if (sort === 'salary_desc') careers.sort((a, b) => b.salaryRange.median - a.salaryRange.median);
      else if (sort === 'salary_asc') careers.sort((a, b) => a.salaryRange.median - b.salaryRange.median);
      else if (sort === 'popular') careers.sort((a, b) => b.viewsCount - a.viewsCount);
    }

    // Extract dynamic unique domains for filter chips
    const domains = Array.from(new Set(mockCareers.map((c) => c.domain)));

    res.status(200).json({
      success: true,
      count: careers.length,
      domains: ['All', ...domains],
      careers,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Smart Autocomplete Search
export const getSearchAutocomplete = async (req: Request, res: Response): Promise<void> => {
  try {
    const { q } = req.query;
    if (!q || typeof q !== 'string') {
      res.status(200).json({ success: true, suggestions: [] });
      return;
    }

    const query = q.toLowerCase();
    const suggestions = mockCareers
      .filter((c) => c.title.toLowerCase().includes(query) || c.domain.toLowerCase().includes(query) || c.requiredSkills.some((s: any) => s.name.toLowerCase().includes(query)))
      .map((c) => ({
        id: c._id,
        slug: c.slug,
        title: c.title,
        domain: c.domain,
        medianSalary: c.salaryRange.median,
        demand: c.jobDemand,
      }))
      .slice(0, 8);

    res.status(200).json({
      success: true,
      suggestions,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Get Career by Slug or ID
export const getCareerDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const idOrSlug = String(req.params.idOrSlug);
    let career: any;

    try {
      career = await Career.findOne({
        $or: [{ slug: idOrSlug.toLowerCase() }, { _id: idOrSlug.match(/^[0-9a-fA-F]{24}$/) ? idOrSlug : null }],
      });
      if (career) {
        career.viewsCount = (career.viewsCount || 0) + 1;
        await career.save();
      }
    } catch (e) {
      career = mockCareers.find((c) => c.slug === idOrSlug.toLowerCase() || c._id === idOrSlug);
    }

    if (!career) {
      career = mockCareers.find((c) => c.slug === idOrSlug.toLowerCase() || c._id === idOrSlug);
    }

    if (!career) {
      res.status(404).json({ success: false, message: 'Career profile not found in Career Bank.' });
      return;
    }

    // Dynamic AI Voice Pep Talk synthesis text
    const voiceScript = career.voicePepTalk || aiService.generateVoiceMentorPepTalk(career.title);

    res.status(200).json({
      success: true,
      career,
      voiceScript,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Get Trending and Top Pick Careers
export const getFeaturedCareers = async (req: Request, res: Response): Promise<void> => {
  try {
    const trending = mockCareers.filter((c) => c.isTrending);
    const topPicks = mockCareers.filter((c) => c.isTopPick);

    res.status(200).json({
      success: true,
      trending,
      topPicks,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
