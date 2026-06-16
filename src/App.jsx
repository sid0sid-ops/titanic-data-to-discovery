import Navbar from './components/Navbar.jsx';
import Hero from './components/Hero.jsx';
import Workflow from './components/Workflow.jsx';
import NotebookTimeline from './components/NotebookTimeline.jsx';
import LibraryEcosystem from './components/LibraryEcosystem.jsx';
import DatasetSection from './components/DatasetSection.jsx';
import CleaningSection from './components/CleaningSection.jsx';
import EDASection from './components/EDASection.jsx';
import GraphGallery from './components/GraphGallery.jsx';
import ModelSection from './components/ModelSection.jsx';
import AdvancedMLWorkflow from './components/AdvancedMLWorkflow.jsx';
import ModelComparison from './components/ModelComparison.jsx';
import GridSearchExplainer from './components/GridSearchExplainer.jsx';
import PipelineDiagram from './components/PipelineDiagram.jsx';
import RocAucSection from './components/RocAucSection.jsx';
import DataLeakageWarning from './components/DataLeakageWarning.jsx';
import ResultsSection from './components/ResultsSection.jsx';
import PassengerPredictor from './components/PassengerPredictor.jsx';
import PredictionSection from './components/PredictionSection.jsx';
import EconomicImpact from './components/EconomicImpact.jsx';
import Reflections from './components/Reflections.jsx';
import DownloadCenter from './components/DownloadCenter.jsx';
import Footer from './components/Footer.jsx';

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Workflow />
        <NotebookTimeline />
        <LibraryEcosystem />
        <DatasetSection />
        <CleaningSection />
        <EDASection />
        <GraphGallery />
        <ModelSection />
        <AdvancedMLWorkflow />
        <PipelineDiagram />
        <ModelComparison />
        <GridSearchExplainer />
        <RocAucSection />
        <DataLeakageWarning />
        <ResultsSection />
        <PassengerPredictor />
        <PredictionSection />
        <EconomicImpact />
        <Reflections />
        <DownloadCenter />
      </main>
      <Footer />
    </>
  );
}
