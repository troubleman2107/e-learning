import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { EditAuthorForm } from "./edit-author-form";

type EditAuthorPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditAuthorPage({ params }: EditAuthorPageProps) {
  const { id } = await params;

  const author = await prisma.author.findUnique({
    where: { id },
  });

  if (!author) {
    notFound();
  }

  return <EditAuthorForm author={author} />;
}
