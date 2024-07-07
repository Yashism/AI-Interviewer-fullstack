import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
  } from "./../components/ui/accordion";
  import { Sparkle } from "lucide-react";
  
  export const FaqElement = () => {
    return (
      <>
        <div className="w-full gap-4 p-6">
          <div className="flex flex-row-2 gap-6 tems-center justify-center">
          <Sparkle className="h-8 w-8" />
            <h1 className="text-3xl items-center font-work-sans">FAQs</h1>
          </div>
          <Accordion
            type="single"
            collapsible
            className="w-full justify-between pt-6"
          >
            <AccordionItem value="item-1">
              <AccordionTrigger>
              What is AI-Interviewer and who is it for?
              </AccordionTrigger>
              <AccordionContent>
              AI-Interviewer is a platform designed for job seekers to practice mock interviews and receive detailed feedback, and for companies to efficiently screen applicants with customizable interview questions.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>How does AI-Interviewer help users improve their interview skills?</AccordionTrigger>
              <AccordionContent>
              Users can practice various types of mock interviews, including company-specific, resume-based, and technical coding interviews. They receive detailed feedback on their answers, highlighting mistakes and providing tips for improvement.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>
               What are the main features available for users?
              </AccordionTrigger>
              <AccordionContent>
              Practice mock interviews based on job descriptions or company-specific questions,
              Receive detailed feedback on answers and interview performance,
              Access tips and tricks for impressing interviewers,
              Practice technical coding interviews with feedback on problem-solving skills,
              Experience adaptive interview difficulty levels,
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>
              What benefits does AI-Interviewer offer to companies?
              </AccordionTrigger>
              <AccordionContent>
              AI-Interviewer provides companies with tools for efficient applicant screening, customizable interview questions, detailed logs, summaries, statistics, and AI-generated questions based on feedback, helping streamline the recruitment process.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5">
                <AccordionTrigger>Is it free ?</AccordionTrigger>
                <AccordionContent>AI-Interviewer operates on a subscription-based model, offering different tiers for users and customized options for companies to suit their specific needs.</AccordionContent></AccordionItem>          </Accordion>
          <p></p>
        </div>
      </>
    );
  };