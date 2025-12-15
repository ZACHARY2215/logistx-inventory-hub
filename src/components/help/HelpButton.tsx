import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { HelpCircle, BookOpen, MessageCircleQuestion, Download, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FAQModal } from './FAQModal';
import { generateManualPDF } from '@/lib/generatePDF';

export const HelpButton = () => {
  const [faqOpen, setFaqOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <HelpCircle className="h-5 w-5" />
            <span className="sr-only">Help</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem asChild>
            <Link to="/docs" className="flex items-center cursor-pointer">
              <BookOpen className="mr-2 h-4 w-4" />
              <span>Documentation</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setFaqOpen(true)} className="cursor-pointer">
            <MessageCircleQuestion className="mr-2 h-4 w-4" />
            <span>FAQ</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={generateManualPDF} className="cursor-pointer">
            <Download className="mr-2 h-4 w-4" />
            <span>Download Manual (PDF)</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <a
              href="mailto:support@logistx.com"
              className="flex items-center cursor-pointer"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              <span>Contact Support</span>
            </a>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <FAQModal open={faqOpen} onOpenChange={setFaqOpen} />
    </>
  );
};
