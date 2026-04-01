import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface FaqItem {
  title: string;
  text: string;
}

export type FaqItems = Array<FaqItem>;

export function Faq() {
  const items: FaqItems = [
    {
      title: 'How do I get started?',
      text: 'Getting started is easy. Simply navigate to the Dashboard to view your overview, or go to Playbook Studio to create and manage your playbooks.',
    },
    {
      title: 'What is a Playbook?',
      text: 'A Playbook is a predefined workflow or set of instructions that can be executed to automate tasks and processes within your system.',
    },
    {
      title: 'How do I create a new Playbook?',
      text: 'Navigate to Playbook Studio and click "Create New". You can define your playbook using YAML or the visual editor.',
    },
    {
      title: 'Where can I find documentation?',
      text: 'Documentation is available in the Docs section. You can access it from the footer links or contact support for assistance.',
    },
  ];

  const generateItems = () => {
    return (
      <Accordion type="single" collapsible>
        {items.map((item, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger>{item.title}</AccordionTrigger>
            <AccordionContent>{item.text}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>FAQ</CardTitle>
      </CardHeader>
      <CardContent className="py-3">{generateItems()}</CardContent>
    </Card>
  );
}
