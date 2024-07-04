package step_executors

import "ai-developer/app/workflow_executors/step_executors/steps"

type ServerStartTestExecutor interface {
	StepExecutor
	Execute(step steps.ServerStartTestStep) error
}
