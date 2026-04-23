import { getSignedMediaUrl } from "@/lib/data";

export async function SignedImage({
  path,
  alt,
}: {
  path: string | null;
  alt: string;
}) {
  const url = await getSignedMediaUrl(path);

  if (!url) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center rounded-[2rem] bg-[#f6dcc7] text-sm font-semibold text-black/45">
        暂无图片
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} className="aspect-[4/3] w-full rounded-[2rem] object-cover" src={url} />
  );
}

export async function SignedVideo({
  path,
}: {
  path: string | null;
}) {
  const url = await getSignedMediaUrl(path);

  if (!url) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-[2rem] bg-black/85 text-sm font-semibold text-white/70">
        上传视频后会显示播放器
      </div>
    );
  }

  return <video className="aspect-video w-full rounded-[2rem] bg-black" controls src={url} />;
}
