'use client'

import React, { useState, useActionState } from 'react'
import * as tw from '../app/tailwind'
import { Input } from '@/components/ui/input'
import { Textarea } from './ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import MDEditor from "@uiw/react-md-editor";
import { Button } from '@/components/ui/button'
import { Send } from 'lucide-react'
import { formSchema } from '@/sanity/lib/validation'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { createProject } from '@/lib/actions'

const ProjectForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    imageFile: null as File | null,
  })

  const [tag, setTag] = React.useState('');
  const router = useRouter();

  const handleFormSubmit = async (prevState: any, _formData: FormData) => {
    try {
      const formValues = {
        title: formData.title,
        description: formData.description,
        tagline: tag,
        category: formData.category,
        imageFile: formData.imageFile,
      };
  
      // Will throw if validation fails
      await formSchema.parseAsync(formValues);
  
      console.log(formValues);

      const formDataObj = new FormData();
      formDataObj.append('title', formData.title);
      formDataObj.append('description', formData.description);
      formDataObj.append('category', formData.category);
      if (formData.imageFile) {
        formDataObj.append('imageFile', formData.imageFile);
      }
      const result = await createProject(prevState, formDataObj, tag);
      
      if (result && '_id' in result) {
        router.push(`/project/${result._id}`);
      } else {
        console.error('Project creation failed or result does not contain an id.');
      }

      return result;


    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors = error.flatten().fieldErrors;
        setErrors(fieldErrors as unknown as Record<string, string>);
        return {
          ...prevState,
          error: 'Validation failed',
          status: 'ERROR',
        };
      }
  
      return {
        ...prevState,
        error: 'An unexpected error occurred',
        status: 'ERROR',
      };
    }
  };

  const [state, formAction, isPending] = useActionState(handleFormSubmit,{
    error: "",
    status: 'INITIAL',
    });

  

  const [errors, setErrors] = useState<Record<string, string>>({})

  return (
    <form action={formAction} className={`${tw.startup_form} relative`}>
      {/* Title */}
      <div>
        <label htmlFor="title" className={tw.startup_form_label}>
          Title
        </label>
        <Input
          id="title"
          name="title"
          className={tw.startup_form_input}
          required
          placeholder="Project Title"
          value={formData.title}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, title: e.target.value }))
          }
        />
        {errors.title && (
          <p className="mt-2 text-l text-red-500 text-left">{errors.title}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className={tw.startup_form_label}>
          Description
        </label>
        <Textarea
          id="description"
          name="description"
          className={tw.startup_form_textarea}
          required
          placeholder="Project Description"
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
        />
        {errors.description && (
          <p className="mt-2 text-l text-red-500 text-left">{errors.description}</p>
        )}
      </div>

      {/* Category */}
      <div className="relative">
        <label htmlFor="category" className={tw.startup_form_label}>
          Category
        </label>
        <Select
        onValueChange={(value) => {
            setFormData((prev) => ({ ...prev, category: value }));
            setErrors((prev) => ({ ...prev, category: '' })); // ✅ clear error
        }}
        defaultValue={formData.category}
        >
          <SelectTrigger className={`${tw.startup_form_input} cursor-pointer`}>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent className="z-50 bg-white shadow-xl border rounded-md" >
            <SelectItem value="Technology" className="cursor-pointer">Technology</SelectItem>
            <SelectItem value="Design" className="cursor-pointer">Design</SelectItem>
            <SelectItem value="Education" className="cursor-pointer">Education</SelectItem>
            <SelectItem value="Health" className="cursor-pointer">Health</SelectItem>
            <SelectItem value="Entertainment" className="cursor-pointer">Entertainment</SelectItem>
          </SelectContent>
        </Select>
        {errors.category && (
          <p className="mt-2 text-l text-red-500 text-left">{errors.category}</p>
        )}
      </div>
    {/* Thumbnail Upload */}
    <div className="mt-6">
    {/* Top label */}
    <label htmlFor="image" className={tw.startup_form_label}>
        Upload Thumbnail
    </label>

    {/* Hidden file input */}
    <input
    type="file"
    id="image"
    accept="image/*"
    onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) {
        setFormData((prev) => ({ ...prev, imageFile: file }));
        setErrors((prev) => ({ ...prev, imageFile: '' })); // ✅ clear error
        }
    }}
    className="hidden"
    />

    {/* Custom file button */}
    <div className="mt-2">
        <label
        htmlFor="image"
        className="inline-block cursor-pointer bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition"
        >
        Choose Image
        </label>
    </div>

    {/* Image name + preview */}
    {formData.imageFile && (
        <div className="mt-3">
        <p className="text-sm text-gray-600">{formData.imageFile.name}</p>
        <img
            src={URL.createObjectURL(formData.imageFile)}
            alt="Preview"
            className="mt-2 max-h-48 rounded border"
        />
        </div>
    )}
    </div>

    {errors.imageFile && (
  <p className="mt-2 text-l text-red-500 text-left">{errors.imageFile}</p>
)}

    {/* Markdown Editor with Drag-and-Drop Image Upload */}
        <div
        data-color-mode="light"

        onDragOver={(e) => e.preventDefault()}
        onDrop={async (e) => {
            e.preventDefault()
            const file = e.dataTransfer.files?.[0]
            if (!file || !file.type.startsWith('image/')) return
          
            const formData = new FormData()
            formData.append('image', file)
          
            try {
              const res = await fetch('/api/upload', {
                method: 'POST', 
                body: formData,
              })
          
              const { url } = await res.json()
              const markdownImage = `\n\n![${file.name}](${url})\n\n`
              setTag((prev) => prev + markdownImage)
            } catch (err) {
              console.error('Upload error:', err)
            }
          }}
        >
        <label htmlFor="tag" className={tw.startup_form_label}>
            Blog Content
        </label>

        <MDEditor
            value={tag}
            onChange={(value) => setTag(value as string)}
            id="tag"
            preview="live"
            height={300}
            style= {{borderRadius: 20, overflow: "hidden"}}
            textareaProps={{
                placeholder: "Write your project content here..."
            }}
            previewOptions={{
                disallowedElements: ["style"],
            }}

        />

        {errors.description && (
            <p className="mt-2 text-l text-red-500 text-left">{errors.description}</p>
        )}
        </div>

        <Button type='submit' className={`${tw.startup_form_btn} text-white`}
        disabled={isPending}>
            {isPending ? 'Submitting...' : 'Submit Your Project'}
            <Send className='size-6 ml-2'/>

        </Button>



    </form>
  )
}

export default ProjectForm
