import { useState, useRef, type KeyboardEvent } from "react";
import { FadeInUp } from "../components/ui/FadeInUp";
import { UploadCloud, CheckCircle2, FileVideo, Tags } from "lucide-react";
import { cn } from "../lib/utils";
import { submitDoctorArticle } from "../lib/api";

export function DoctorEditor() {
  const [tags, setTags] = useState<string[]>(["孕早期", "营养"]);
  const [tagInput, setTagInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("孕期科普");
  const [content, setContent] = useState("");
  const [submitState, setSubmitState] = useState<"idle" | "submitting" | "done" | "error">("idle");

  const handleTagKeydown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleSimulateUpload = () => {
    setIsUploading(true);
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setIsUploading(false), 800); // short delay to show 100%
          return 100;
        }
        return prev + 5;
      });
    }, 100);
  };

  const handleSubmit = async () => {
    try {
      setSubmitState("submitting");
      await submitDoctorArticle({
        title: title.trim() || "未命名科普标题",
        category,
        tags,
        content: content.trim() || "（未填写正文内容）",
      });
      setSubmitState("done");
      setTimeout(() => setSubmitState("idle"), 2000);
    } catch {
      setSubmitState("error");
      setTimeout(() => setSubmitState("idle"), 2500);
    }
  };

  return (
    <div className="min-h-screen bento-card md:mt-4 md:mx-auto max-w-5xl flex flex-col pt-6 pb-20">
      {/* Top action bar */}
      <div className="px-8 flex items-center justify-between mb-12">
        <div className="text-sm font-medium text-[#86868B] flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          草稿已自动保存 于 10:42
        </div>
        <button
          onClick={handleSubmit}
          disabled={submitState === "submitting"}
          className={cn(
            "text-white px-6 py-2.5 rounded-full font-medium transition-colors hover:scale-105 duration-300",
            submitState === "submitting" ? "bg-[#0066CC]/60 cursor-not-allowed" : "bg-[#0066CC] hover:bg-[#0055AA]",
          )}
        >
          {submitState === "submitting" ? "提交中..." : submitState === "done" ? "已提交" : submitState === "error" ? "提交失败" : "提交审核"}
        </button>
      </div>

      <div className="px-8 max-w-3xl mx-auto w-full flex-1 flex flex-col">
        <FadeInUp delay={0.1}>
          {/* Title Input */}
          <input
            type="text"
            placeholder="请输入科普文章大标题..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-4xl md:text-5xl font-semibold tracking-tight text-[#1D1D1F] border-none outline-none placeholder:text-gray-300 mb-8"
          />

          {/* Tags / Category Wrapper */}
          <div className="flex items-center gap-3 mb-10 flex-wrap">
            <div className="flex items-center gap-2 bg-[#F5F5F7] px-4 py-2 rounded-full">
              <Tags className="w-4 h-4 text-[#86868B]" />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="bg-transparent border-none outline-none text-sm font-medium text-[#1D1D1F]"
              >
                <option>孕期科普</option>
                <option>新生儿护理</option>
                <option>心理健康</option>
              </select>
            </div>

            {tags.map(tag => (
              <span key={tag} className="flex items-center gap-1 bg-[#E8F0FE] text-[#0066CC] px-3 py-1.5 rounded-full text-sm font-medium">
                #{tag}
                <button onClick={() => removeTag(tag)} className="hover:text-red-500 ml-1">✕</button>
              </span>
            ))}

            <input
              type="text"
              placeholder="回车添加标签..."
              className="bg-transparent text-sm border-none outline-none placeholder:text-gray-400 min-w-[120px]"
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={handleTagKeydown}
            />
          </div>

          {/* Editor Placeholder - in a real app this would be a rich text editor */}
          <div className="w-full min-h-[300px] mb-12">
            <textarea 
              placeholder="从这里开始撰写医学科普内容..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-full min-h-[300px] resize-none text-lg text-[#1D1D1F] leading-relaxed border-none outline-none placeholder:text-gray-300"
            />
          </div>
        </FadeInUp>
      </div>

      {/* File Upload Area at Bottom */}
      <div className="px-8 max-w-4xl mx-auto w-full mt-auto">
        <FadeInUp delay={0.2}>
          <div 
            onClick={!isUploading ? handleSimulateUpload : undefined}
            className={cn(
              "w-full rounded-3xl border-2 border-dashed flex flex-col items-center justify-center p-12 transition-all duration-300",
              isUploading ? "border-[#0066CC]/30 bg-[#0066CC]/5" : "border-gray-200 hover:border-[#0066CC] hover:bg-gray-50 cursor-pointer"
            )}
          >
            {isUploading ? (
              <div className="relative flex items-center justify-center w-16 h-16 mb-4">
                 <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="46" fill="transparent" stroke="#E5E7EB" strokeWidth="4" />
                    <circle 
                      cx="50" cy="50" r="46" fill="transparent" stroke="#0066CC" strokeWidth="6" 
                      strokeDasharray="289" strokeDashoffset={289 - (289 * uploadProgress) / 100}
                      className="transition-all duration-100 ease-linear" strokeLinecap="round" 
                    />
                 </svg>
                 <span className="absolute text-xs font-semibold text-[#0066CC]">{uploadProgress}%</span>
              </div>
            ) : uploadProgress === 100 ? (
              <>
                <div className="p-4 bg-green-50 rounded-full mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-xl font-medium text-[#1D1D1F] mb-1">资源文件已上传并处理完毕</h3>
              </>
            ) : (
              <>
                 <div className="p-4 bg-[#F5F5F7] rounded-full mb-4">
                   <UploadCloud className="w-8 h-8 text-[#86868B]" />
                 </div>
                 <h3 className="text-xl font-medium text-[#1D1D1F] mb-2">拖拽视频文件或PDF到此处上传</h3>
                 <p className="text-sm text-[#86868B]">支持 .mp4, .mov, .pdf 格式，最大 500MB</p>
                 <div className="mt-6 flex items-center gap-4 text-sm font-medium text-[#0066CC]">
                   <span className="flex items-center gap-1.5"><FileVideo className="w-4 h-4"/> 添加视频附件</span>
                 </div>
              </>
            )}
          </div>
        </FadeInUp>
      </div>
    </div>
  );
}
