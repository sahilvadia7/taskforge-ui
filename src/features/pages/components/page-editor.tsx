import { usePageStore } from "@/store/use-page-store";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Eye, Edit2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

export function PageEditor() {
    const { selectedPageId, pages, updatePage } = usePageStore();
    const page = pages.find(p => p.id === selectedPageId);

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [icon, setIcon] = useState("📄");
    const [isPreview, setIsPreview] = useState(false);

    // Sync state when page changes
    useEffect(() => {
        if (page) {
            setTitle(page.title);
            setContent(page.content);
            setIcon(page.icon || "📄");
            setIsPreview(false); // Reset to edit mode on page change
        }
    }, [page?.id]);

    if (!page) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                    <span className="text-3xl">👋</span>
                </div>
                <p>Select a page to view or edit</p>
            </div>
        );
    }

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(e.target.value);
        updatePage(page.id, { title: e.target.value });
    };

    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setContent(e.target.value);
        updatePage(page.id, { content: e.target.value });
    };

    const handleIconChange = (newIcon: string) => {
        setIcon(newIcon);
        updatePage(page.id, { icon: newIcon });
    };

    return (
        <div className="flex-1 h-full overflow-y-auto bg-background">
            <div className="max-w-3xl mx-auto py-12 px-8">
                {/* Header / Icon */}
                <div className="flex justify-between items-start mb-8">
                    <div className="group relative">
                        <div className="text-5xl cursor-pointer hover:bg-muted/50 rounded-lg w-fit p-2 transition-colors relative">
                            {icon}
                            <input
                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                value={icon}
                                onChange={(e) => handleIconChange(e.target.value)}
                            />
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsPreview(!isPreview)}
                        className="gap-2"
                    >
                        {isPreview ? <><Edit2 className="h-4 w-4" /> Edit</> : <><Eye className="h-4 w-4" /> Preview</>}
                    </Button>
                </div>

                {/* Title */}
                <Input
                    className="text-4xl font-bold border-none shadow-none px-0 h-auto focus-visible:ring-0 placeholder:text-muted-foreground/50 bg-transparent mb-6"
                    placeholder="Untitled"
                    value={title}
                    onChange={handleTitleChange}
                    disabled={isPreview}
                />

                {/* Content Editor or Preview */}
                {isPreview ? (
                    <article className="prose prose-slate dark:prose-invert max-w-none min-h-[500px]">
                        <ReactMarkdown>{content || "*No content*"}</ReactMarkdown>
                    </article>
                ) : (
                    <Textarea
                        className="w-full min-h-[500px] border-none shadow-none resize-none focus-visible:ring-0 p-0 text-lg leading-relaxed bg-transparent font-mono text-sm sm:text-lg"
                        placeholder="Start typing (Markdown supported)..."
                        value={content}
                        onChange={handleContentChange}
                    />
                )}
            </div>
        </div>
    );
}
