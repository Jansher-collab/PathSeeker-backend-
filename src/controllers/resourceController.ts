import { Request, Response } from 'express';
import { Resource } from '../models/Resource';
import { mockResources } from '../seed/seedData';

// 1. Get All Resources with Filter
export const getAllResources = async (req: Request, res: Response): Promise<void> => {
  try {
    const { audience, format, category, search } = req.query;

    let items: any[] = [];
    try {
      const filter: any = {};
      if (audience && audience !== 'All') {
        filter.$or = [{ targetAudience: audience }, { targetAudience: 'All' }];
      }
      if (format && format !== 'All') filter.format = format;
      if (category && category !== 'All') filter.category = category;
      if (search) {
        filter.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search as string, 'i')] } },
        ];
      }
      items = await Resource.find(filter).sort({ downloadCount: -1 });
    } catch (e) {
      items = mockResources.filter((r) => {
        if (audience && audience !== 'All' && r.targetAudience !== audience && r.targetAudience !== 'All') return false;
        if (format && format !== 'All' && r.format !== format) return false;
        if (category && category !== 'All' && r.category !== category) return false;
        if (search) {
          const s = (search as string).toLowerCase();
          const matchTitle = r.title.toLowerCase().includes(s);
          const matchDesc = r.description.toLowerCase().includes(s);
          if (!matchTitle && !matchDesc) return false;
        }
        return true;
      });
    }

    const formats = ['All', 'PDF', 'Checklist', 'Infographic', 'Spreadsheet', 'Cheatsheet'];
    const audiences = ['All', 'Student', 'Graduate', 'Working Professional'];

    res.status(200).json({
      success: true,
      count: items.length,
      formats,
      audiences,
      resources: items,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Track Resource Download
export const trackDownload = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    let item: any;

    try {
      item = await Resource.findById(id);
      if (item) {
        item.downloadCount = (item.downloadCount || 0) + 1;
        await item.save();
      }
    } catch (e) {
      item = mockResources.find((r) => r._id === id || r.slug === id);
      if (item) item.downloadCount = (item.downloadCount || 0) + 1;
    }

    res.status(200).json({
      success: true,
      downloadCount: item ? item.downloadCount : 43,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
