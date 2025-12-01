-- Users profile table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'admin')),
  learning_mode TEXT DEFAULT 'standard' CHECK (learning_mode IN ('standard', 'adhd', 'dyslexia', 'visual', 'auditory')),
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'starter', 'pro', 'team')),
  subscription_status TEXT DEFAULT 'inactive' CHECK (subscription_status IN ('inactive', 'active', 'canceled', 'past_due')),
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Courses / Classes (for teachers)
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID REFERENCES public.profiles(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can manage own courses" ON public.courses
  FOR ALL USING (auth.uid() = teacher_id);

CREATE POLICY "Students can view enrolled courses" ON public.courses
  FOR SELECT USING (
    is_public = true OR
    EXISTS (
      SELECT 1 FROM public.enrollments
      WHERE course_id = courses.id AND student_id = auth.uid()
    )
  );

-- Enrollments (student-course relationship)
CREATE TABLE public.enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES public.profiles(id) NOT NULL,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(course_id, student_id)
);

ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own enrollments" ON public.enrollments
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Teachers can manage enrollments for own courses" ON public.enrollments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.courses
      WHERE id = enrollments.course_id AND teacher_id = auth.uid()
    )
  );

-- Audio materials (uploaded by teachers)
CREATE TABLE public.materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES public.profiles(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  audio_url TEXT,
  audio_duration INTEGER, -- in seconds
  google_drive_file_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can manage own materials" ON public.materials
  FOR ALL USING (auth.uid() = teacher_id);

CREATE POLICY "Students can view materials from enrolled courses" ON public.materials
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.enrollments e
      JOIN public.courses c ON c.id = e.course_id
      WHERE e.student_id = auth.uid()
      AND (materials.course_id = c.id OR materials.teacher_id = c.teacher_id)
    )
  );

-- Transcriptions
CREATE TABLE public.transcriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id UUID REFERENCES public.materials(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  language TEXT DEFAULT 'pl',
  word_count INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.transcriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Access transcriptions through materials" ON public.transcriptions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.materials m
      WHERE m.id = transcriptions.material_id
      AND (
        m.teacher_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.enrollments e
          JOIN public.courses c ON c.id = e.course_id
          WHERE e.student_id = auth.uid() AND m.course_id = c.id
        )
      )
    )
  );

-- AI-generated notes
CREATE TABLE public.notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id UUID REFERENCES public.materials(id) ON DELETE CASCADE NOT NULL,
  learning_mode TEXT NOT NULL CHECK (learning_mode IN ('standard', 'adhd', 'dyslexia', 'visual', 'auditory')),
  content JSONB NOT NULL, -- structured notes with sections, key points, summary
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Access notes through materials" ON public.notes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.materials m
      WHERE m.id = notes.material_id
      AND (
        m.teacher_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.enrollments e
          JOIN public.courses c ON c.id = e.course_id
          WHERE e.student_id = auth.uid() AND m.course_id = c.id
        )
      )
    )
  );

-- Quizzes
CREATE TABLE public.quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id UUID REFERENCES public.materials(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  questions JSONB NOT NULL, -- array of {question, options, correct_answer, explanation}
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Access quizzes through materials" ON public.quizzes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.materials m
      WHERE m.id = quizzes.material_id
      AND (
        m.teacher_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.enrollments e
          JOIN public.courses c ON c.id = e.course_id
          WHERE e.student_id = auth.uid() AND m.course_id = c.id
        )
      )
    )
  );

-- Quiz attempts/results
CREATE TABLE public.quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES public.profiles(id) NOT NULL,
  answers JSONB NOT NULL,
  score INTEGER NOT NULL,
  max_score INTEGER NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can manage own quiz attempts" ON public.quiz_attempts
  FOR ALL USING (auth.uid() = student_id);

CREATE POLICY "Teachers can view quiz attempts for own materials" ON public.quiz_attempts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.quizzes q
      JOIN public.materials m ON m.id = q.material_id
      WHERE q.id = quiz_attempts.quiz_id AND m.teacher_id = auth.uid()
    )
  );

-- Flashcards
CREATE TABLE public.flashcard_decks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id UUID REFERENCES public.materials(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  cards JSONB NOT NULL, -- array of {front, back}
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.flashcard_decks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Access flashcards through materials" ON public.flashcard_decks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.materials m
      WHERE m.id = flashcard_decks.material_id
      AND (
        m.teacher_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.enrollments e
          JOIN public.courses c ON c.id = e.course_id
          WHERE e.student_id = auth.uid() AND m.course_id = c.id
        )
      )
    )
  );

-- Flashcard progress (spaced repetition)
CREATE TABLE public.flashcard_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deck_id UUID REFERENCES public.flashcard_decks(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES public.profiles(id) NOT NULL,
  card_index INTEGER NOT NULL,
  ease_factor REAL DEFAULT 2.5,
  interval INTEGER DEFAULT 1, -- days
  repetitions INTEGER DEFAULT 0,
  next_review TIMESTAMPTZ DEFAULT NOW(),
  last_reviewed TIMESTAMPTZ,
  UNIQUE(deck_id, student_id, card_index)
);

ALTER TABLE public.flashcard_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can manage own flashcard progress" ON public.flashcard_progress
  FOR ALL USING (auth.uid() = student_id);

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_materials_updated_at
  BEFORE UPDATE ON public.materials
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
