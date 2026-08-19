import FeedbackLanding from '~/components/FeedbackLanding';

// Hide standard headers/footers to test the full-screen mobile look
export const handle = {
  hideLayout: true,
};

export default function DemoFeedbackRoute() {
  return <FeedbackLanding />;
}
