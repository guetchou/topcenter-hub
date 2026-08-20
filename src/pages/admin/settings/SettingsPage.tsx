import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Json } from "@/integrations/supabase/types";
import { GeneralSettingsTab } from "@/components/admin/settings/GeneralSettingsTab";
import { MetaSettingsTab } from "@/components/admin/settings/MetaSettingsTab";
import { SocialSettingsTab } from "@/components/admin/settings/SocialSettingsTab";

interface SiteSettings {
  site_name: string;
  site_description: string;
  contact_email: string;
  social_media: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  meta_settings: {
    title_suffix: string;
    default_meta_description: string;
    google_analytics_id?: string;
  };
}

export const SettingsPage = () => {
  const [settings, setSettings] = useState<SiteSettings>({
    site_name: "",
    site_description: "",
    contact_email: "",
    social_media: {},
    meta_settings: {
      title_suffix: "",
      default_meta_description: "",
    }
  });

  const { data: existingSettings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('page_contents')
        .select('*')
        .eq('page_key', 'site_settings')
        .single();

      if (error) throw error;
      return data?.content as unknown as SiteSettings;
    }
  });

  useEffect(() => {
    if (existingSettings) {
      setSettings(existingSettings);
    }
  }, [existingSettings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { error } = await supabase
        .from('page_contents')
        .upsert({
          page_key: 'site_settings',
          title: 'Site Settings',
          content: settings as unknown as Json,
        });

      if (error) throw error;
      toast.success("Paramètres mis à jour avec succès");
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      toast.error("Une erreur est survenue");
    }
  };

  const updateSettings = (key: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const updateMetaSettings = (key: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      meta_settings: {
        ...prev.meta_settings,
        [key]: value
      }
    }));
  };

  const updateSocialMedia = (key: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      social_media: {
        ...prev.social_media,
        [key]: value
      }
    }));
  };

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Paramètres</h1>
        <Button onClick={handleSubmit}>
          <Save className="w-4 h-4 mr-2" />
          Enregistrer
        </Button>
      </div>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">Général</TabsTrigger>
          <TabsTrigger value="meta">SEO & Métadonnées</TabsTrigger>
          <TabsTrigger value="social">Réseaux sociaux</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <GeneralSettingsTab
            settings={settings}
            updateSettings={updateSettings}
          />
        </TabsContent>

        <TabsContent value="meta">
          <MetaSettingsTab
            metaSettings={settings.meta_settings}
            updateMetaSettings={updateMetaSettings}
          />
        </TabsContent>

        <TabsContent value="social">
          <SocialSettingsTab
            socialMedia={settings.social_media}
            updateSocialMedia={updateSocialMedia}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
