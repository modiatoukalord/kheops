
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
  DropdownMenuLabel,
  DropdownMenuCheckboxItem
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
  Film,
  Puzzle,
  BookCopy,
  DiscAlbum,
  UploadCloud,
  Shirt,
  DollarSign,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

export const initialContent: Content[] = [];

export type Content = {
    id: string;
    title: string;
    type: "Livre" | "Article" | "Manga" | "Film" | "Jeu de société" | "Projet Studio" | "Produit Wear";
    author: string; // Doubles as price for "Produit Wear"
    status: "Publié" | "Brouillon";
    lastUpdated: string;
    imageUrl?: string;
    summary?: string;
    wearCategory?: "T-Shirts" | "Hoodies & Sweats" | "Accessoires";
};
type ContentStatus = Content["status"];
type ContentType = Content["type"];


const statusConfig = {
  Publié: { variant: "default", icon: CheckCircle },
  Brouillon: { variant: "secondary", icon: Edit },
};

const typeConfig: { [key in ContentType]: { icon: React.ElementType, label: string } } = {
  Livre: { icon: BookOpen, label: "Livre" },
  Article: { icon: FileText, label: "Article" },
  Manga: { icon: BookCopy, label: "Manga" },
  Film: { icon: Film, label: "Film" },
  "Jeu de société": { icon: Puzzle, label: "Jeu de société" },
  "Projet Studio": { icon: DiscAlbum, label: "Projet Studio" },
  "Produit Wear": { icon: Shirt, label: "Produit Wear" },
};

const wearCategories: Content['wearCategory'][] = ["T-Shirts", "Hoodies & Sweats", "Accessoires"];

interface ContentManagementProps {
  content: Content[];
  onAddContent: (content: Omit<Content, 'id'>) => Promise<void>;
  onUpdateContent: (id: string, content: Partial<Omit<Content, 'id'>>) => Promise<void>;
  onDeleteContent: (id: string) => Promise<void>;
}


export default function ContentManagement({ content, onAddContent, onUpdateContent, onDeleteContent }: ContentManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  const [typeFilters, setTypeFilters] = useState<ContentType[]>([]);
  const [statusFilters, setStatusFilters] = useState<ContentStatus[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<ContentType>('Article');

  const handleAddContent = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const title = formData.get("title") as string;
    const type = formData.get("type") as Content["type"];
    const summary = formData.get("summary") as string;
    const wearCategory = formData.get("wearCategory") as Content["wearCategory"];

    const newContent: Partial<Omit<Content, 'id'>> = {
      title,
      type,
      author: formData.get("author") as string, // This is also used for price
      status: "Brouillon",
      lastUpdated: new Date().toISOString().split("T")[0],
    };
    
    if (summary) {
        newContent.summary = summary;
    }

    if (previewImage) {
        newContent.imageUrl = previewImage;
    }

    if (type === 'Produit Wear' && wearCategory) {
        newContent.wearCategory = wearCategory;
    }

    await onAddContent(newContent as Omit<Content, 'id'>);
    toast({
      title: "Contenu Ajouté",
      description: `Le contenu "${title}" a été ajouté comme brouillon.`,
    });
    setDialogOpen(false);
    setPreviewImage(null);
  };
  
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStatusChange = async (id: string, status: ContentStatus) => {
    await onUpdateContent(id, { status, lastUpdated: new Date().toISOString().split("T")[0] });
    toast({
        title: "Statut mis à jour",
        description: `Le contenu a été marqué comme ${status.toLowerCase()}.`
    })
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce contenu ?")) {
      await onDeleteContent(id);
      toast({
        title: "Contenu Supprimé",
        variant: "destructive"
      });
    }
  }

  const filteredContent = content.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilters.length === 0 || typeFilters.includes(item.type);
    const matchesStatus = statusFilters.length === 0 || statusFilters.includes(item.status);

    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <CardTitle>Gestion des Contenus</CardTitle>
            <CardDescription>
              Ajoutez, modifiez ou supprimez des livres, articles, produits et autres contenus.
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  Filtrer
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filtrer par Type</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {Object.keys(typeConfig).map((type) => (
                  <DropdownMenuCheckboxItem
                    key={type}
                    checked={typeFilters.includes(type as ContentType)}
                    onCheckedChange={(checked) =>
                      setTypeFilters(
                        checked
                          ? [...typeFilters, type as ContentType]
                          : typeFilters.filter((t) => t !== type)
                      )
                    }
                  >
                    {type}
                  </DropdownMenuCheckboxItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Filtrer par Statut</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {Object.keys(statusConfig).map((status) => (
                  <DropdownMenuCheckboxItem
                    key={status}
                    checked={statusFilters.includes(status as ContentStatus)}
                    onCheckedChange={(checked) =>
                      setStatusFilters(
                        checked
                          ? [...statusFilters, status as ContentStatus]
                          : statusFilters.filter((s) => s !== status)
                      )
                    }
                  >
                    {status}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Dialog open={isDialogOpen} onOpenChange={(isOpen) => { if (!isOpen) setPreviewImage(null); setDialogOpen(isOpen); }}>
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
                      Remplissez les informations pour créer une nouvelle oeuvre.
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
                          <Label htmlFor="type">Type de contenu</Label>
                          <Select name="type" required defaultValue={selectedType} onValueChange={(value) => setSelectedType(value as ContentType)}>
                              <SelectTrigger>
                              <SelectValue placeholder="Sélectionner un type" />
                              </SelectTrigger>
                              <SelectContent>
                              {Object.entries(typeConfig).map(([key, { label }]) => (
                                <SelectItem key={key} value={key}>{label}</SelectItem>
                              ))}
                              </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="author">{selectedType === 'Produit Wear' ? 'Prix' : 'Auteur / Créateur'}</Label>
                          <div className="relative">
                            {selectedType === 'Produit Wear' && <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />}
                            <Input
                                id="author"
                                name="author"
                                placeholder={selectedType === 'Produit Wear' ? 'Ex: 25000' : 'Nom du créateur'}
                                type={selectedType === 'Produit Wear' ? 'number' : 'text'}
                                className={selectedType === 'Produit Wear' ? 'pl-10' : ''}
                                required
                            />
                          </div>
                        </div>
                    </div>
                    {selectedType === 'Produit Wear' && (
                        <div className="space-y-2">
                            <Label htmlFor="wearCategory">Catégorie Wear</Label>
                            <Select name="wearCategory" required>
                                <SelectTrigger>
                                <SelectValue placeholder="Sélectionner une catégorie" />
                                </SelectTrigger>
                                <SelectContent>
                                {wearCategories.map(category => (
                                    <SelectItem key={category} value={category!}>{category}</SelectItem>
                                ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="image">Image de couverture</Label>
                      <div className="flex items-center gap-4">
                         <div className="w-full">
                           <Input id="image" name="image" type="file" onChange={handleImageChange} accept="image/*" />
                           <p className="text-xs text-muted-foreground mt-1">Téléversez l'image pour le contenu.</p>
                         </div>
                         {previewImage && (
                             // eslint-disable-next-line @next/next/no-img-element
                             <img src={previewImage} alt="Aperçu" className="h-16 w-16 object-cover rounded-md border" />
                         )}
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
                <TableHead className="hidden md:table-cell">Auteur/Prix</TableHead>
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
                           {typeInfo.label}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {item.type === 'Produit Wear' ? `${Number(item.author).toLocaleString('fr-FR')} FCFA` : item.author}
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
                            <DropdownMenuItem className="text-red-500" onClick={() => handleDelete(item.id)}>
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

    