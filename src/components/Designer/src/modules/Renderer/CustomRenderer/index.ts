import { ModuleDeclaration } from 'didi';
import CustomRenderer from '@/components/Designer/src/modules/Renderer/CustomRenderer/CustomRenderer';

const customRenderer: ModuleDeclaration = {
  __init__: ['customRenderer'],
  customRenderer: ['type', CustomRenderer],
};

export default customRenderer;
