import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

const AdminSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState("security");

  return (
    <ProtectedRoute requireAdmin>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Paramètres d'administration</h1>
        
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="security">Sécurité</TabsTrigger>
            <TabsTrigger value="appearance">Apparence</TabsTrigger>
            <TabsTrigger value="system">Système</TabsTrigger>
          </TabsList>
          
          <TabsContent value="security">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">Paramètres de sécurité</h2>
              <p className="text-muted-foreground">
                Les paramètres de sécurité seront disponibles dans une future mise à jour.
              </p>
            </Card>
          </TabsContent>
          
          <TabsContent value="appearance">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">Personnalisation de l'interface</h2>
              <p className="text-muted-foreground">
                Les options de personnalisation seront disponibles dans une future mise à jour.
              </p>
            </Card>
          </TabsContent>
          
          <TabsContent value="system">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">Configuration système</h2>
              <p className="text-muted-foreground">
                Les paramètres système seront disponibles dans une future mise à jour.
              </p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  );
};

export default AdminSettings;
