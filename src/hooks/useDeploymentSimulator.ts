import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { defaultPricingModel } from "@/models/pricing";

export interface BusinessInfo {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  industry: string;
  employees: number[];
  budget: string;
}

export interface PackageConfig {
  agentCount: number[];
  servicePeriod: string;
  callVolume: string;
  includeSupport: boolean;
  includeCRM: boolean;
  multilingual: boolean;
}

export interface QuoteResult {
  basePrice: number;
  setup: number;
  additionalFeatures: number;
  total: number;
}

export function useDeploymentSimulator() {
  const { toast } = useToast();

  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    industry: "",
    employees: [10],
    budget: "",
  });

  const [packageConfig, setPackageConfig] = useState<PackageConfig>({
    agentCount: [5],
    servicePeriod: "monthly",
    callVolume: "medium",
    includeSupport: true,
    includeCRM: false,
    multilingual: false,
  });

  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [quoteResult, setQuoteResult] = useState<QuoteResult | null>(null);
  const [deploymentStatus, setDeploymentStatus] = useState<"idle" | "running" | "success" | "failed">("idle");
  const [currentStep, setCurrentStep] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);

  const handleBusinessInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBusinessInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleSliderChange = (name: string, value: number[]) => {
    if (name === "agentCount") {
      setPackageConfig((prev) => ({ ...prev, agentCount: value }));
    } else if (name === "employees") {
      setBusinessInfo((prev) => ({ ...prev, employees: value }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setPackageConfig((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setPackageConfig((prev) => ({ ...prev, [name]: checked }));
  };

  const toggleService = (serviceId: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId) ? prev.filter((id) => id !== serviceId) : [...prev, serviceId]
    );
  };

  const calculateQuote = () => {
    const agentCount = packageConfig.agentCount[0];
    const monthlyBasePrice = agentCount * defaultPricingModel.baseAgentPrice;
    const supportFee = packageConfig.includeSupport ? defaultPricingModel.supportFee : 0;
    const crmFee = packageConfig.includeCRM ? defaultPricingModel.crmFee : 0;
    const multilingualFee = packageConfig.multilingual ? defaultPricingModel.multilingualFee : 0;
    const additionalFeatures = supportFee + crmFee + multilingualFee;

    let total = monthlyBasePrice + additionalFeatures;
    if (packageConfig.servicePeriod === "yearly") {
      total = total * 12 * (1 - defaultPricingModel.yearlyDiscount);
    }

    const setupFee = defaultPricingModel.setupFee;

    return {
      basePrice: monthlyBasePrice,
      setup: setupFee,
      additionalFeatures,
      total: total + setupFee,
    };
  };

  const generateQuote = () => {
    if (!businessInfo.companyName || !businessInfo.email) {
      toast({
        title: "Information manquante",
        description: "Veuillez remplir les informations de contact requises.",
        variant: "destructive",
      });
      return;
    }

    setQuoteResult(calculateQuote());
    toast({ title: "Devis généré", description: "Votre devis a été généré avec succès!" });
  };

  const startDeployment = () => {
    if (!quoteResult) {
      toast({
        title: "Génération requise",
        description: "Veuillez d'abord générer un devis.",
        variant: "destructive",
      });
      return;
    }

    setDeploymentStatus("running");
    setCurrentStep(1);
    setLogs(["Démarrage du déploiement..."]);

    const steps = [
      "Vérification des prérequis...",
      "Configuration des services...",
      "Création des utilisateurs...",
      "Configuration de la base de données...",
      "Déploiement des agents virtuels...",
      "Configuration du serveur...",
      "Test des connexions...",
      "Finalisation du déploiement...",
    ];

    let stepIndex = 0;
    const deployInterval = setInterval(() => {
      if (stepIndex < steps.length) {
        setLogs((prev) => [...prev, steps[stepIndex]]);
        stepIndex++;
        setCurrentStep(stepIndex + 1);
      } else {
        clearInterval(deployInterval);
        setLogs((prev) => [...prev, "Déploiement terminé avec succès!"]);
        setDeploymentStatus("success");
      }
    }, 1500);

    return () => clearInterval(deployInterval);
  };

  const resetForm = () => {
    setBusinessInfo({
      companyName: "",
      contactName: "",
      email: "",
      phone: "",
      industry: "",
      employees: [10],
      budget: "",
    });
    setPackageConfig({
      agentCount: [5],
      servicePeriod: "monthly",
      callVolume: "medium",
      includeSupport: true,
      includeCRM: false,
      multilingual: false,
    });
    setSelectedServices([]);
    setQuoteResult(null);
    setDeploymentStatus("idle");
    setCurrentStep(0);
    setLogs([]);
    toast({ title: "Formulaire réinitialisé", description: "Vous pouvez maintenant créer un nouveau devis." });
  };

  const downloadQuote = () => {
    toast({
      title: "Téléchargement du devis",
      description: "Le devis sera téléchargé en format PDF.",
    });
    console.log("Download quote for:", businessInfo, packageConfig, quoteResult);
  };

  return {
    businessInfo,
    packageConfig,
    selectedServices,
    quoteResult,
    deploymentStatus,
    currentStep,
    logs,
    handleBusinessInfoChange,
    handleSliderChange,
    handleSelectChange,
    handleSwitchChange,
    toggleService,
    generateQuote,
    startDeployment,
    resetForm,
    downloadQuote,
  };
}
