import {defineField, defineType} from 'sanity'

export const workoutType = defineType({
  name: 'workout',
  title: 'Workout',
  type: 'document',
  preview: {
    select: {
      date: 'date',
      duration: 'duration',
      exercises: 'exercises',
    },
    prepare({date, duration, exercises}) {
      const formattedDate = date ? new Date(date).toLocaleDateString() : 'No date'
      const minutes = duration ? Math.floor(duration / 60) : 0

      const exerciseCount = exercises ? exercises.length : 0
      const exerciseText = exerciseCount === 1 ? 'exercise' : 'exercises'

      return {
        title: formattedDate,
        subtitle: `${minutes} min • ${exerciseCount} ${exerciseText}`,
      }
    },
  },
  icon: () => '💪',
  fields: [
    defineField({
      name: 'userId',
      title: 'User ID',
      type: 'string',
      description: 'Clerk user ID',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'date',
      title: 'Date',
      type: 'datetime',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'duration',
      title: 'Duration (seconds)',
      type: 'number',
      validation: (rule) => rule.required().min(0),
    }),
    defineField({
      name: 'exercises',
      title: 'Workout Exercises',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'workoutExercise',
          title: 'Workout Exercise',
          fields: [
            defineField({
              name: 'exercise',
              title: 'Exercise',
              description: 'The exercise performed in this workout',
              type: 'reference',
              to: [{type: 'exercise'}],
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'sets',
              title: 'Sets',
              description: 'The sets performed for this exercise with reps and weight',
              type: 'array',
              of: [
                {
                  type: 'object',
                  name: 'exerciseSet',
                  title: 'Set',
                  fields: [
                    defineField({
                      name: 'reps',
                      title: 'Reps',
                      type: 'number',
                      validation: (rule) => rule.required().min(1),
                    }),
                    defineField({
                      name: 'weight',
                      title: 'Weight',
                      type: 'number',
                      validation: (rule) => rule.required().min(0),
                    }),
                    defineField({
                      name: 'weightUnit',
                      title: 'Weight Unit',
                      type: 'string',
                      options: {
                        list: [
                          {title: 'Kilograms', value: 'kg'},
                          {title: 'Pounds', value: 'lbs'},
                        ],
                        layout: 'radio',
                      },
                      initialValue: 'kg',
                      validation: (rule) => rule.required(),
                    }),
                  ],
                  preview: {
                    select: {
                      reps: 'reps',
                      weight: 'weight',
                      weightUnit: 'weightUnit',
                    },
                    prepare({reps, weight, weightUnit}) {
                      return {
                        title: `${reps} reps × ${weight} ${weightUnit || 'kg'}`,
                      }
                    },
                  },
                },
              ],
            }),
          ],
          preview: {
            select: {
              title: 'exercise.name',
              sets: 'sets',
            },
            prepare({title, sets}) {
              return {
                title: title || 'No exercise',
                subtitle: `${sets?.length || 0} sets`,
              }
            },
          },
        },
      ],
    }),
  ],
})
