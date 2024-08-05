import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import FeedbackReport from '../../components/FeedbackReport';

const FeedbackPage = () => {
  const router = useRouter();
  const { interviewId } = router.query;
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    if (interviewId) {
      // Fetch the report data using the interviewId
      fetch(`/api/get-report?interviewId=${interviewId}`)
        .then(response => response.json())
        .then(data => setReportData(data))
        .catch(error => {
          console.error('Error fetching report:', error);
          setReportData(null); // Set to null on error to display the "No report data available" message
        });
    }
  }, [interviewId]);

  if (!reportData) {
    return <div>Loading...</div>;
  }

  return <FeedbackReport reportData={reportData} />;
};

export default FeedbackPage;