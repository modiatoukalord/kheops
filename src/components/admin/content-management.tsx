"use client";

import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  MoreHorizontal,
  PlusCircle,
  Search,
  Filter,
  BookOpen,
  FileText,
  Edit,
  Trash2,
  CheckCircle,
  Eye,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

const initialContent = [
  {
    id: "cont-001",
    title: "Le Labyrinthe d'Osiris",
    type: "Livre" as "Livre" | "Article",
    author: "KHEOPS Publishing",
    status: "Publié" as "Publié" | "Brouillon",
    lastUpdated: "2024-07-15",
  },
  {
    id: "cont-002",
    title: "Pharaoh's Legacy Vol. 1",
    type: "Livre" as "Livre" | "Article",
    author: "KHEOPS Manga",
    status: "Publié" as "Publié" | "Brouillon",
    lastUpdated: "2024-07-20",
  },
  {
    id: "cont-003",
    title: "L'art du Hiéroglyphe",
    type: "Article" as "Livre" | "Article",
    author: "Dr. A. Diop",
    status: "Brouillon" as "Publié" | "Brouillon",
    lastUpdated: "2024-08-01",
  },
  {
    id: "cont-004",
    title: "Les Chroniques de Thot",
    type: "Livre" as "Livre" | "Article",
    author: "KHEOPS Publishing",
    status: "Brouillon" as "Publié" | "Brouillon",
    lastUpdated: "2024-08-05",
  },
];

type Content = (typeof initialContent)[0];
type ContentStatus = Content["status"];

const statusConfig = {
  Publié: { variant: "default", icon: CheckCircle },
  Brouillon: { variant: "secondary", icon: Edit },
};

const typeConfig = {
  Livre: { icon: BookOpen },
  Article: { icon: FileText },
};

export default function ContentManagement() {
  const [content, setContent] = useState(initialContent);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleAddContent = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const title = formData.get("title") as string;
    const type = formData.get("type") as Content["type"];

    const newContent: Content = {
      id: `cont-${Date.now()}`,
      title,
      type,
      author: formData.get("author") as string,
      status: "Brouillon",
      lastUpdated: new Date().toISOString().split("T")[0],
    };

    setContent((prev) => [newContent, ...prev]);
    toast({
      title: "Contenu Ajouté",
      description: `Le contenu "${title}" a été ajouté comme brouillon.`,
    });
    setDialogOpen(false);
  };

  const handleStatusChange = (id: string, status: ContentStatus) => {
    setContent(
      content.map((c) =>
        c.id === id
          ? { ...c, status, lastUpdated: new Date().toISOString().split("T")[0] }
          : c
      )
    );
    toast({
        title: "Statut mis à jour",
        description: `Le contenu a été marqué comme ${status.toLowerCase()}.`
    })
  };

  const filteredContent = content.filter(
    (item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <CardTitle>Gestion des Contenus</CardTitle>
            <CardDescription>
              Ajoutez, modifiez ou supprimez des livres et articles.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par titre ou auteur..."
                className="pl-10 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filtrer
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Ajouter
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[525px]">
                <form onSubmit={handleAddContent}>
                  <DialogHeader>
                    <DialogTitle>Ajouter un nouveau contenu</DialogTitle>
                    <DialogDescription>
                      Remplissez les informations pour créer un nouveau livre
                      ou article.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Titre</Label>
                      <Input
                        id="title"
                        name="title"
                        placeholder="Titre du contenu"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                        <Label htmlFor="author">Auteur</Label>
                        <Input
                            id="author"
                            name="author"
                            placeholder="Nom de l'auteur"
                            required
                        />
                        </div>
                        <div className="space-y-2">
                        <Label htmlFor="type">Type de contenu</Label>
                        <Select name="type" required defaultValue="Article">
                            <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un type" />
                            </SelectTrigger>
                            <SelectContent>
                            <SelectItem value="Livre">Livre</SelectItem>
                            <SelectItem value="Article">Article</SelectItem>
                            </SelectContent>
                        </Select>
                        </div>
                    </div>
                     <div className="space-y-2">
                      <Label htmlFor="summary">Résumé (Optionnel)</Label>
                      <Textarea id="summary" name="summary" placeholder="Bref résumé du contenu..." />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Ajouter comme Brouillon</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titre</TableHead>
                <TableHead className="hidden sm:table-cell">Type</TableHead>
                <TableHead className="hidden md:table-cell">Auteur</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="hidden md:table-cell">
                  Dernière mise à jour
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContent.length > 0 ? (
                filteredContent.map((item) => {
                  const statusInfo = statusConfig[item.status];
                  const typeInfo = typeConfig[item.type];
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.title}</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div className="flex items-center gap-2">
                           <typeInfo.icon className="h-4 w-4 text-muted-foreground" />
                           {item.type}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {item.author}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusInfo.variant}>
                          <statusInfo.icon className="mr-1.5 h-3.5 w-3.5" />
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {new Date(item.lastUpdated).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              Prévisualiser
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                             <DropdownMenuItem onClick={() => handleStatusChange(item.id, 'Publié')}>
                              <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                              Publier
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-500">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Aucun contenu trouvé.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
